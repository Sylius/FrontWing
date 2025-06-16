export interface ProductImage {
    path: string;
}

export interface ProductData {
    code: string;
    images?: ProductImage[];
}

export interface ProductVariantDetails {
    code: string;
    name?: string;
    optionValues?: {
        code: string;
        value: string;
        option?: {
            code: string;
            name: string;
        };
    }[];
    product?: ProductData;
}

export interface OrderItem {
    variant: string | ProductVariantDetails;
    productName?: string | null;
    id?: number;
    quantity?: number;
    unitPrice?: number;
    originalUnitPrice?: number | null;
    total?: number;
    discountedUnitPrice?: number;
    subtotal?: number;
}

export interface AddressInterface {
    firstName?: string;
    lastName?: string;
    fullName?: string | null;
    phoneNumber?: string;
    company?: string;
    countryCode?: string;
    provinceCode?: string | null;
    provinceName?: string | null;
    street?: string;
    city?: string;
    postcode?: string;
    createdAt?: string;
    updatedAt?: string | null;
    id?: number;
    customer?: string | null;
    email?: string;
    gender?: 'm' | 'f' | 'u' | null;
}

export interface Payment {
    "@id"?: string;
    "@type"?: string;
    id?: number;
    method?: {
        name?: string;
    } | null;
    state?: string;
}

export interface Shipment {
    id?: number;
    "@id"?: string;
    "@type"?: string;
    method?: string;
}

export interface ShippingAddress {
    firstName?: string;
    lastName?: string;
}

export interface Order {
    id?: number;
    number: string;
    tokenValue: string;
    state: string;
    itemsSubtotal: number;
    currencyCode: string;
    shippingAddress?: AddressInterface;
    billingAddress?: AddressInterface;
    payments?: Payment[];
    shipments?: Shipment[];
    createdAt?: string;
    total?: number;
    taxTotal?: number;
    orderPromotionTotal?: number;
    shippingTotal?: number;
    promotionCoupon?: {
        code: string;
    };
    items?: OrderItem[];
    localeCode?: string;
    paymentState?: string;
    checkoutCompletedAt?: string;
}
