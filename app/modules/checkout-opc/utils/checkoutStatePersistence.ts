import type { CheckoutState } from "~/modules/checkout-opc/types";

const STORAGE_KEY = "opc-checkout-state";

interface PersistedCheckout {
    key: string;
    state: CheckoutState;
}

const getStorage = (): Storage | null => {
    if (typeof window === "undefined") return null;
    try {
        return window.sessionStorage;
    } catch {
        return null;
    }
};

export const loadPersistedCheckoutState = (key: string | undefined): CheckoutState | null => {
    const storage = getStorage();
    if (!storage || !key) return null;

    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw) as PersistedCheckout;
        if (parsed.key !== key) {
            storage.removeItem(STORAGE_KEY);
            return null;
        }
        return parsed.state;
    } catch {
        storage.removeItem(STORAGE_KEY);
        return null;
    }
};

export const savePersistedCheckoutState = (
    key: string | undefined,
    state: CheckoutState,
): void => {
    const storage = getStorage();
    if (!storage || !key) return;

    try {
        storage.setItem(STORAGE_KEY, JSON.stringify({ key, state } satisfies PersistedCheckout));
    } catch {
        return;
    }
};

export const clearPersistedCheckoutState = (): void => {
    const storage = getStorage();
    if (!storage) return;
    try {
        storage.removeItem(STORAGE_KEY);
    } catch {
        return;
    }
};
