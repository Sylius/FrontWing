import type { AddressInterface } from "~/types/Order";

export interface Country {
    code: string;
    name: string;
}

export type AddressFieldName =
    | "firstName"
    | "lastName"
    | "company"
    | "street"
    | "countryCode"
    | "city"
    | "postcode"
    | "phoneNumber";

export interface DeliveryEstimate {
    from: string;
    to: string;
}

export interface CheckoutShippingMethod {
    code: string;
    name: string;
    logoUrl?: string;
    price?: number;
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

export interface OrderLineItem {
    id: number;
    productName: string;
    imageUrl?: string;
    quantity: number;
    unitPrice: number;
    originalUnitPrice?: number;
}

export interface OrderItemPricing {
    id: number;
    unitPrice: number;
    originalUnitPrice: number | null;
    discountedUnitPrice: number;
}

export interface OrderTotals {
    itemsSubtotal: number;
    itemsCount: number;
    shippingTotal: number;
    shippingDiscountTotal: number;
    discountTotal: number;
    taxTotal: number;
    total: number;
}

export interface SecurePayments {
    provider: string;
}

export interface OrderSummary {
    currencyCode: string;
    shippingMethods: CheckoutShippingMethod[];
    paymentMethods: CheckoutPaymentMethod[];
    selectedShippingMethod: string | null;
    selectedPaymentMethod: string | null;
    totals: OrderTotals;
    items: OrderItemPricing[];
    estimatedDelivery?: DeliveryEstimate;
    securePayments?: SecurePayments;
    hash?: string;
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
