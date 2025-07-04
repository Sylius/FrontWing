export interface Product {
    id: number;
    slug: string;
    name: string;
    code: string;
    description: string;
    shortDescription: string;
    variants: string[];
    images: Image[];
    options?: string[];
    reviews?: { '@id': string }[];
    mainTaxon?: string;
    productTaxons?: string[];
    defaultVariant?: string;
    associations?: string[];
}

export interface ProductOption {
    code: string;
    name: string;
    values: ProductOptionValue[];
}

export interface ProductOptionValue {
    code: string;
    value: string;
}

export interface ProductVariantDetails {
    id: number;
    price: number;
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
    product?: Product;
}

export interface Image {
    id: number;
    path: string;
}

export interface ProductAttribute {
    id: number;
    name: string;
    value: string;
}

export interface ProductReview {
    id: number;
    title: string;
    rating: number;
    comment: string;
    createdAt: string;
    author?: {
        firstName: string | null;
    };
}

export interface Order {
    id?: number;
    tokenValue?: string;
    items?: OrderItem[];
    itemsTotal?: number;
    itemsSubtotal?: number;
    total?: number;
    shippingTotal?: number;
    taxTotal?: number;
    shippingTaxTotal?: number;
    shippingState?: string;
    paymentState?: string;
    checkoutState?: string;
    state?: string;
    orderPromotionTotal?: number;
    shippingPromotionTotal?: number;
    promotionCoupon?: {
        code: string;
    };
}

export interface OrderItem {
    id?: number;
    productName?: string | null;
    quantity?: number;
    unitPrice?: number;
    subtotal?: number;
    variant?: string | ProductVariantDetails;
}
