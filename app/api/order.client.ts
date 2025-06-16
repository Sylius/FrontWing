export async function pickupCartClient(): Promise<string> {
    const API_URL = window?.ENV?.API_URL || "";

    const response = await fetch(`${API_URL}/api/v2/shop/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
    });

    if (!response.ok) throw new Error("Failed to create a new cart");

    const data = await response.json();

    document.cookie = `orderToken=${data.tokenValue}; path=/; max-age=2592000; SameSite=Lax`;

    return data.tokenValue;
}

export async function fetchOrderFromAPIClient(token: string, throwOnFail = false) {
    const API_URL = window?.ENV?.API_URL || "";

    const response = await fetch(`${API_URL}/api/v2/shop/orders/${token}`);

    if (!response.ok) {
        if (throwOnFail) throw new Error("Failed to fetch order");
        return null;
    }

    return await response.json();
}

export async function updateOrderItemAPIClient({
                                                   id,
                                                   quantity,
                                                   token,
                                               }: {
    id: number;
    quantity: number;
    token: string;
}) {
    const API_URL = window?.ENV?.API_URL || "";

    const response = await fetch(
        `${API_URL}/api/v2/shop/orders/${token}/items/${id}`,
        {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity }),
        }
    );

    if (!response.ok) throw new Error("Failed to update item");

    return await response.json();
}

export async function removeOrderItemAPIClient({
                                                   id,
                                                   token,
                                               }: {
    id: number;
    token: string;
}) {
    const API_URL = window?.ENV?.API_URL || "";

    const response = await fetch(
        `${API_URL}/api/v2/shop/orders/${token}/items/${id}`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) throw new Error("Failed to remove item");
}

export async function attachCustomerToOrderAPIClient({
                                                         token,
                                                         customerIri,
                                                     }: {
    token: string;
    customerIri: string;
}) {
    const API_URL = window?.ENV?.API_URL || "";

    const response = await fetch(`${API_URL}/api/v2/shop/orders/${token}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/merge-patch+json",
        },
        body: JSON.stringify({ customer: customerIri }),
    });

    if (!response.ok) throw new Error("Failed to attach customer to order");

    return await response.json();
}

export async function updateOrderBillingAddressEmail({
                                                         token,
                                                         email,
                                                     }: {
    token: string;
    email: string;
}) {
    const API_URL = window?.ENV?.API_URL || "";

    const response = await fetch(`${API_URL}/api/v2/shop/orders/${token}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/merge-patch+json",
        },
        body: JSON.stringify({
            billingAddress: {
                email,
            },
        }),
    });

    if (!response.ok) throw new Error("Failed to update billing address email");

    return await response.json();
}
