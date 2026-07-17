import type { AddressInterface } from "./Order";

export interface DeliveryEstimate {
    from: string;
    to: string;
}

export interface CheckoutShippingMethod {
    code: string;
    name: string;
    logoUrl?: string;
    price: number;
    originalPrice?: number;
    estimatedDelivery?: DeliveryEstimate;
    enabled: boolean;
}

export interface CheckoutPaymentMethod {
    code: string;
    name: string;
    logoUrl?: string;
    enabled: boolean;
}

export interface OrderLineItemOption {
    name: string;
    value: string;
}

export interface OrderLineItem {
    id: number;
    productName: string;
    variantCode: string;
    imageUrl?: string;
    options?: OrderLineItemOption[];
    quantity: number;
    unitPrice: number;
    originalUnitPrice?: number;
    subtotal: number;
}

export interface OrderTotals {
    itemsSubtotal: number;
    itemsCount: number;
    shippingTotal: number;
    discountTotal: number;
    taxTotal: number;
    total: number;
}

export interface LoyaltyReward {
    points: number;
    value: number;
    currency: string;
    clubName: string;
}

export interface FreeShippingProgress {
    remaining: number;
    progressPercent: number;
}

export interface SecurePayments {
    provider: string;
    cardBrands: string[];
}

export interface OrderSummary {
    currencyCode: string;
    shippingMethods: CheckoutShippingMethod[];
    paymentMethods: CheckoutPaymentMethod[];
    selectedShippingMethod: string | null;
    selectedPaymentMethod: string | null;
    totals: OrderTotals;
    estimatedDelivery?: DeliveryEstimate;
    loyalty?: LoyaltyReward;
    freeShipping?: FreeShippingProgress;
    securePayments?: SecurePayments;
}

export interface CheckoutStateItem {
    id: number;
    quantity: number;
}

export interface CheckoutState {
    email: string;
    billingAddress: AddressInterface;
    shippingAddress: AddressInterface;
    useDifferentShipping: boolean;
    items: CheckoutStateItem[];
    shippingMethodCode: string | null;
    paymentMethodCode: string | null;
    couponCode: string | null;
}
