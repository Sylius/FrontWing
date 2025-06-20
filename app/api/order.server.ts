import type { Order, OrderItem } from "~/types/Order";
import type { Product, ProductVariantDetails } from "~/types/Product";

const API_URL = process.env.PUBLIC_API_URL;

export const pickupCart = async (): Promise<string> => {
    const response = await fetch(`${API_URL}/api/v2/shop/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
    });
    if (!response.ok) {
        const msg = await response.text();
        console.error("pickupCart failed:", response.status, msg);
        throw new Error("Failed to create a new cart");
    }
    const data = await response.json();
    return data.tokenValue;
};

export const fetchOrderFromAPI = async (token: string, withDetails = false): Promise<Order> => {
    const url = `${API_URL}/api/v2/shop/orders/${token}`;
    const response = await fetch(url);

    if (!response.ok) {
        const msg = await response.text();
        console.error("fetchOrderFromAPI failed:", response.status, msg);
        throw new Error("Failed to fetch order");
    }

    const order: Order = await response.json();
    if (!withDetails || !order.items) return order;

    const enrichedItems = await Promise.all(
        order.items.map(async (item: OrderItem) => {
            try {
                const variantRes = await fetch(`${API_URL}${item.variant}`);
                if (!variantRes.ok) throw new Error("Variant fetch failed");
                const rawVariant = await variantRes.json();

                const optionValuesWithOptions = await Promise.all(
                    (rawVariant.optionValues ?? []).map(async (ov: string) => {
                        try {
                            const valueRes = await fetch(`${API_URL}${ov}`);
                            if (!valueRes.ok) throw new Error();
                            const val = await valueRes.json();

                            if (!val.option || typeof val.option !== "string") return val;

                            const optionRes = await fetch(`${API_URL}${val.option}`);
                            if (!optionRes.ok) throw new Error();
                            const option = await optionRes.json();

                            return { ...val, option };
                        } catch {
                            return null;
                        }
                    })
                );

                const productRes = await fetch(`${API_URL}${rawVariant.product}`);
                if (!productRes.ok) throw new Error("Product fetch failed");
                const product: Product = await productRes.json();

                return {
                    ...item,
                    variant: {
                        ...rawVariant,
                        optionValues: optionValuesWithOptions.filter(Boolean),
                        product,
                    },
                };
            } catch (err) {
                console.error("Failed to enrich item:", item.id, err);
                return item;
            }
        })
    );

    return { ...order, items: enrichedItems };
};

export const updateOrderItemAPI = async ({
                                             id,
                                             quantity,
                                             token,
                                         }: {
    id: number;
    quantity: number;
    token: string;
}): Promise<void> => {
    const response = await fetch(`${API_URL}/api/v2/shop/orders/${token}/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/merge-patch+json" },
        body: JSON.stringify({ quantity }),
    });
    if (!response.ok) {
        const msg = await response.text();
        console.error("updateOrderItemAPI failed:", response.status, msg);
        throw new Error("Failed to update item quantity");
    }
};

export const removeOrderItemAPI = async ({
                                             id,
                                             token,
                                         }: {
    id: number;
    token: string;
}): Promise<void> => {
    const response = await fetch(`${API_URL}/api/v2/shop/orders/${token}/items/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        const msg = await response.text();
        console.error("removeOrderItemAPI failed:", response.status, msg);
        throw new Error("Failed to remove item from cart");
    }
};

export const fetchCartSuggestions = async () => {
    const res = await fetch(`${API_URL}/api/v2/shop/products?itemsPerPage=4`);
    if (!res.ok) {
        const msg = await res.text();
        console.error("fetchCartSuggestions failed:", res.status, msg);
        throw new Error("Failed to fetch cart suggestions");
    }
    const data = await res.json();
    return data["hydra:member"] || [];
};

export const applyCouponCode = async (token: string, code: string): Promise<void> => {
    const res = await fetch(`${API_URL}/api/v2/shop/orders/${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/ld+json" },
        body: JSON.stringify({ couponCode: code }),
    });
    if (!res.ok) {
        const msg = await res.text();
        console.error("applyCouponCode failed:", res.status, msg);
        throw new Error("Failed to apply coupon code");
    }
};

export const removeCouponCode = async (token: string): Promise<void> => {
    const res = await fetch(`${API_URL}/api/v2/shop/orders/${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/ld+json" },
        body: JSON.stringify({ couponCode: null }),
    });
    if (!res.ok) {
        const msg = await res.text();
        console.error("removeCouponCode failed:", res.status, msg);
        throw new Error("Failed to remove coupon code");
    }
};
