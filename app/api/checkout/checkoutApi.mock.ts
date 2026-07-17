import type { AddressInterface } from "~/types/Order";
import type {
    CheckoutPaymentMethod,
    CheckoutShippingMethod,
    CheckoutState,
    Country,
    FreeShippingProgress,
    LoyaltyReward,
    OrderLineItem,
    OrderSummary,
    OrderTotals,
    SecurePayments,
} from "~/types/Checkout";
import type { CheckoutApi } from "./checkoutApi";

import addressesJson from "./mocks/addresses.json";
import countriesJson from "./mocks/countries.json";
import itemsJson from "./mocks/items.json";
import catalogJson from "./mocks/orderSummary.json";

interface MockShippingMethod extends CheckoutShippingMethod {
    availableCountries?: string[];
}

interface MockCatalog {
    currencyCode: string;
    defaultShippingMethodCode: string | null;
    shippingMethods: MockShippingMethod[];
    paymentMethods: CheckoutPaymentMethod[];
    loyalty?: LoyaltyReward;
    securePayments?: SecurePayments;
}

const catalog: MockCatalog = catalogJson;
const addresses: AddressInterface[] = addressesJson;
const countries: Country[] = countriesJson;
const items: OrderLineItem[] = itemsJson;

const LATENCY_MS = 300;

const DEFAULT_COUNTRY_CODE = "PL";

const FREE_SHIPPING_THRESHOLD = 250000;

const ORDER_PROMOTION_TOTAL = -6259;

const MOCK_COUPONS: Record<string, number> = {
    SOLENNE10: 0.1,
    WELCOME5: 0.05,
};

const delay = (ms: number = LATENCY_MS): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

const clone = <T>(value: T): T => structuredClone(value);

const toContractShippingMethod = (method: MockShippingMethod): CheckoutShippingMethod => ({
    code: method.code,
    name: method.name,
    logoUrl: method.logoUrl,
    price: method.price,
    originalPrice: method.originalPrice,
    estimatedDelivery: method.estimatedDelivery,
    enabled: method.enabled,
});

const resolveShippingMethods = (countryCode?: string): CheckoutShippingMethod[] =>
    catalog.shippingMethods
        .filter(
            (method) =>
                !method.availableCountries ||
                (!!countryCode && method.availableCountries.includes(countryCode)),
        )
        .map(toContractShippingMethod);

const resolveFreeShipping = (itemsSubtotal: number): FreeShippingProgress | undefined => {
    if (itemsSubtotal >= FREE_SHIPPING_THRESHOLD) return undefined;

    return {
        remaining: FREE_SHIPPING_THRESHOLD - itemsSubtotal,
        progressPercent: Math.round((itemsSubtotal / FREE_SHIPPING_THRESHOLD) * 100),
    };
};

const calculateTotals = (
    state: CheckoutState,
    shippingMethod: CheckoutShippingMethod | null,
): OrderTotals => {
    const unitPriceById = new Map(items.map((item) => [item.id, item.unitPrice]));

    let itemsSubtotal = 0;
    let itemsCount = 0;

    for (const line of state.items) {
        const unitPrice = unitPriceById.get(line.id);
        if (unitPrice === undefined || line.quantity <= 0) continue;

        itemsSubtotal += unitPrice * line.quantity;
        itemsCount += line.quantity;
    }

    const hasFreeShipping = itemsSubtotal >= FREE_SHIPPING_THRESHOLD;
    const shippingTotal = !shippingMethod || hasFreeShipping ? 0 : shippingMethod.price;

    const couponRate = state.couponCode ? (MOCK_COUPONS[state.couponCode.toUpperCase()] ?? 0) : 0;
    const couponDiscount = -Math.round(itemsSubtotal * couponRate);
    const discountTotal = itemsCount > 0 ? ORDER_PROMOTION_TOTAL + couponDiscount : 0;

    return {
        itemsSubtotal,
        itemsCount,
        shippingTotal,
        discountTotal,
        taxTotal: 0,
        total: itemsSubtotal + shippingTotal + discountTotal,
    };
};

const createInitialMockState = (): CheckoutState => ({
    email: "",
    billingAddress: { countryCode: DEFAULT_COUNTRY_CODE },
    shippingAddress: { countryCode: DEFAULT_COUNTRY_CODE },
    useDifferentShipping: false,
    items: items.map(({ id, quantity }) => ({ id, quantity })),
    shippingMethodCode: catalog.defaultShippingMethodCode,
    paymentMethodCode: null,
    couponCode: null,
});

const syncCheckout = async (token: string, state: CheckoutState): Promise<OrderSummary> => {
    await delay();

    const countryCode = (
        state.useDifferentShipping ? state.shippingAddress : state.billingAddress
    )?.countryCode;

    const shippingMethods = resolveShippingMethods(countryCode);
    const paymentMethods = clone(catalog.paymentMethods);

    const selectedShippingMethod =
        shippingMethods.find((m) => m.code === state.shippingMethodCode && m.enabled) ?? null;
    const selectedPaymentMethod =
        paymentMethods.find((m) => m.code === state.paymentMethodCode && m.enabled) ?? null;

    const totals = calculateTotals(state, selectedShippingMethod);

    return {
        currencyCode: catalog.currencyCode,
        shippingMethods,
        paymentMethods,
        selectedShippingMethod: selectedShippingMethod?.code ?? null,
        selectedPaymentMethod: selectedPaymentMethod?.code ?? null,
        totals,
        estimatedDelivery: selectedShippingMethod?.estimatedDelivery,
        loyalty: catalog.loyalty ? clone(catalog.loyalty) : undefined,
        freeShipping: resolveFreeShipping(totals.itemsSubtotal),
        securePayments: catalog.securePayments ? clone(catalog.securePayments) : undefined,
    };
};

export const checkoutApiMock: CheckoutApi = {
    async getCheckoutAddresses(): Promise<AddressInterface[]> {
        await delay();
        return clone(addresses);
    },

    async getCountries(): Promise<Country[]> {
        await delay();
        return clone(countries);
    },

    async getCheckoutItems(): Promise<OrderLineItem[]> {
        await delay();
        return clone(items);
    },

    getOrderSummary(token: string): Promise<OrderSummary> {
        return syncCheckout(token, createInitialMockState());
    },

    syncCheckout,
};
