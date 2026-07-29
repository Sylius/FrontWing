import type { AddressInterface, Order, OrderItem, ProductVariantDetails } from "~/types/Order";
import type {
    CheckoutPaymentMethod,
    CheckoutShippingMethod,
    CheckoutState,
    OrderItemPricing,
    OrderLineItem,
    OrderSummary,
    OrderTotals,
} from "~/modules/checkout-opc/types";

interface PreviewMethod {
    code: string;
    name: string;
    description?: string | null;
    cost?: number;
}

interface PreviewShipment {
    selectedMethodCode: string | null;
    availableMethods: PreviewMethod[];
}

interface PreviewPayment {
    selectedMethodCode: string | null;
    availableMethods: PreviewMethod[];
}

interface PreviewSummary {
    itemsTotal: number;
    itemsSubtotal: number;
    shippingTotal: number;
    taxTotal: number;
    orderPromotionTotal: number;
    orderAndItemPromotionTotal: number;
    shippingPromotionTotal: number;
    total: number;
    promotionCoupon: { code: string } | null;
}

interface PreviewItem {
    id: number;
    unitPrice: number;
    originalUnitPrice: number | null;
    total: number;
    discountedUnitPrice: number;
    subtotal: number;
}

export interface CheckoutPreview {
    summary: PreviewSummary;
    items: PreviewItem[];
    billingAddress: AddressInterface;
    shippingAddress: AddressInterface;
    shipments: PreviewShipment[];
    payments: PreviewPayment[];
    hash: string;
}

const ADDRESS_FIELDS: (keyof AddressInterface)[] = [
    "firstName",
    "lastName",
    "company",
    "phoneNumber",
    "street",
    "city",
    "postcode",
    "countryCode",
    "provinceCode",
    "provinceName",
];

export const toApiAddress = (address: AddressInterface): Record<string, string> | null => {
    const out: Record<string, string> = {};
    for (const field of ADDRESS_FIELDS) {
        const value = address[field];
        if (typeof value === "string" && value !== "") out[field] = value;
    }
    return Object.keys(out).length > 0 ? out : null;
};

export const buildPreviewBody = (state: CheckoutState): Record<string, unknown> => {
    const body: Record<string, unknown> = {};

    const billing = toApiAddress(state.billingAddress);
    const shipping = state.useDifferentShipping
        ? toApiAddress(state.shippingAddress)
        : billing;

    if (billing) body.billingAddress = billing;
    if (shipping) body.shippingAddress = shipping;
    if (state.shippingMethodCode) body.shipments = [{ methodCode: state.shippingMethodCode }];
    if (state.paymentMethodCode) body.payments = [{ methodCode: state.paymentMethodCode }];
    if (state.couponCode) body.couponCode = state.couponCode;

    return body;
};

export const buildCompleteBody = (state: CheckoutState, hash: string): Record<string, unknown> => {
    const body = buildPreviewBody(state);
    if (state.email) body.email = state.email;
    body.hash = hash;
    return body;
};

const toShippingMethod = (method: PreviewMethod): CheckoutShippingMethod => ({
    code: method.code,
    name: method.name,
    price: method.cost,
    enabled: true,
});

const toPaymentMethod = (method: PreviewMethod): CheckoutPaymentMethod => ({
    code: method.code,
    name: method.name,
    enabled: true,
});

const toPricing = (item: PreviewItem): OrderItemPricing => ({
    id: item.id,
    unitPrice: item.unitPrice,
    originalUnitPrice: item.originalUnitPrice,
    discountedUnitPrice: item.discountedUnitPrice,
});

// Port of Sylius' sylius_order_item_original_price_to_display: the struck-through
// "before" price, or null when there is nothing to cross out.
export const originalPriceToDisplay = (pricing: OrderItemPricing): number | null => {
    const { originalUnitPrice, unitPrice, discountedUnitPrice } = pricing;

    if (
        originalUnitPrice !== null &&
        (originalUnitPrice > unitPrice || originalUnitPrice > discountedUnitPrice)
    ) {
        return originalUnitPrice;
    }

    if (originalUnitPrice === null && unitPrice > discountedUnitPrice) {
        return unitPrice;
    }

    return null;
};

// Overlay preview pricing onto the order-derived display items: the discounted
// unit price is what the customer pays, with the original price struck through.
export const applyItemPricing = (
    items: OrderLineItem[],
    pricing: OrderItemPricing[],
): OrderLineItem[] => {
    const byId = new Map(pricing.map((p) => [p.id, p]));

    return items.map((item) => {
        const p = byId.get(item.id);
        if (!p) return item;

        return {
            ...item,
            unitPrice: p.discountedUnitPrice,
            originalUnitPrice: originalPriceToDisplay(p) ?? undefined,
        };
    });
};

const countItems = (state: CheckoutState): number =>
    state.items.reduce((sum, item) => sum + item.quantity, 0);

const toTotals = (summary: PreviewSummary, itemsCount: number): OrderTotals => ({
    itemsSubtotal: summary.itemsSubtotal,
    itemsCount,
    shippingTotal: summary.shippingTotal,
    shippingDiscountTotal: summary.shippingPromotionTotal,
    discountTotal: summary.orderAndItemPromotionTotal,
    taxTotal: summary.taxTotal,
    total: summary.total,
});

export const mapPreviewToSummary = (
    preview: CheckoutPreview,
    currencyCode: string,
    state: CheckoutState,
): OrderSummary => {
    const shipment = preview.shipments[0];
    const payment = preview.payments[0];

    return {
        currencyCode,
        shippingMethods: (shipment?.availableMethods ?? []).map(toShippingMethod),
        paymentMethods: (payment?.availableMethods ?? []).map(toPaymentMethod),
        selectedShippingMethod: shipment?.selectedMethodCode ?? null,
        selectedPaymentMethod: payment?.selectedMethodCode ?? null,
        totals: toTotals(preview.summary, countItems(state)),
        items: (preview.items ?? []).map(toPricing),
        hash: preview.hash,
    };
};

export const mapOrderItemsToLineItems = (order: Order | null | undefined): OrderLineItem[] => {
    if (!order?.items) return [];

    return order.items
        .filter((item): item is OrderItem & { id: number } => typeof item.id === "number")
        .map((item) => {
            const variant =
                typeof item.variant === "object" ? (item.variant as ProductVariantDetails) : null;

            const unitPrice = item.unitPrice ?? 0;
            const originalUnitPrice =
                item.originalUnitPrice != null && item.originalUnitPrice !== unitPrice
                    ? item.originalUnitPrice
                    : undefined;

            return {
                id: item.id,
                productName: item.productName ?? variant?.name ?? "",
                imageUrl: item.image ?? variant?.product?.images?.[0]?.path,
                quantity: item.quantity ?? 0,
                unitPrice,
                originalUnitPrice,
            };
        });
};
