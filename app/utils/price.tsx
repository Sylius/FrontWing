import type { OrderItem } from "~/types/Order";

const formatPrice = (priceInCents?: number): string => {
    if (priceInCents === undefined) return "-";
    return (priceInCents / 100).toFixed(2);
};

const getUnitPrices = (item: OrderItem) => {
    const originalUnitPrice = item.originalUnitPrice ?? item.unitPrice ?? 0;
    const currentUnitPrice = item.discountedUnitPrice ?? item.unitPrice ?? 0;
    return {
        originalUnitPrice,
        currentUnitPrice,
        hasDiscount: currentUnitPrice < originalUnitPrice,
    };
};

export { formatPrice, getUnitPrices };
