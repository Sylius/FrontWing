import type { AddressInterface, Order } from "~/types/Order";
import type { CheckoutState, Country, OrderSummary } from "~/modules/checkout-opc/types";
import { CheckoutCompleteError, type CheckoutApi, type CheckoutViolation } from "./checkoutApi";
import {
    buildCompleteBody,
    buildPreviewBody,
    mapPreviewToSummary,
    type CheckoutPreview,
} from "./previewCheckout";

const apiUrl = (): string => (typeof window !== "undefined" ? window.ENV?.API_URL ?? "" : "");

const jwt = (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null;

const authHeaders = (): Record<string, string> => {
    const token = jwt();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const NO_CURRENCY = "";

const previewCheckout = async (
    token: string,
    body: Record<string, unknown>,
): Promise<CheckoutPreview> => {
    const res = await fetch(`${apiUrl()}/api/v2/shop/orders/${token}/one-page/preview`, {
        method: "PATCH",
        headers: { "Content-Type": "application/merge-patch+json", ...authHeaders() },
        body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`Preview failed (${res.status})`);

    return (await res.json()) as CheckoutPreview;
};

export const checkoutApiLive: CheckoutApi = {
    async getCountries(): Promise<Country[]> {
        const res = await fetch(`${apiUrl()}/api/v2/shop/countries`);
        if (!res.ok) throw new Error("Failed to fetch countries");

        const data = await res.json();
        return (data["hydra:member"] ?? []).map((c: { code: string; name: string }) => ({
            code: c.code,
            name: c.name,
        }));
    },

    async getCheckoutAddresses(): Promise<AddressInterface[]> {
        const token = jwt();
        if (!token) return [];

        const res = await fetch(`${apiUrl()}/api/v2/shop/addresses`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return [];

        const data = await res.json();
        return data["hydra:member"] ?? [];
    },

    async syncCheckout(token: string, state: CheckoutState): Promise<OrderSummary> {
        const preview = await previewCheckout(token, buildPreviewBody(state));
        return mapPreviewToSummary(preview, NO_CURRENCY, state);
    },

    async completeCheckout(token: string, state: CheckoutState, hash: string): Promise<Order> {
        const res = await fetch(`${apiUrl()}/api/v2/shop/orders/${token}/one-page/complete`, {
            method: "PATCH",
            headers: { "Content-Type": "application/merge-patch+json", ...authHeaders() },
            body: JSON.stringify(buildCompleteBody(state, hash)),
        });

        if (!res.ok) {
            const body = (await res.json().catch(() => null)) as {
                violations?: CheckoutViolation[];
                "hydra:description"?: string;
                detail?: string;
            } | null;
            const violations = Array.isArray(body?.violations) ? body!.violations : [];
            const message =
                body?.["hydra:description"] ?? body?.detail ?? `Checkout failed (${res.status})`;
            throw new CheckoutCompleteError(message, res.status, violations);
        }

        return (await res.json()) as Order;
    },
};
