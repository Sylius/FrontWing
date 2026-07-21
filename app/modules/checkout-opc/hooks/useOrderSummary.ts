import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { checkoutApi } from "~/modules/checkout-opc/api/checkoutApi";
import type { CheckoutState, OrderSummary } from "~/modules/checkout-opc/types";
import { useDebouncedValue } from "./useDebouncedValue";

const DEBOUNCE_MS = 400;

// Only the fields that can change the summary go into the query key. Editing a field
// the server ignores (e.g. name) must not trigger a recalculation.
const summaryKey = (state: CheckoutState) => ({
    billingCountry: state.billingAddress.countryCode ?? null,
    shippingCountry: state.shippingAddress.countryCode ?? null,
    useDifferentShipping: state.useDifferentShipping,
    items: state.items,
    shippingMethodCode: state.shippingMethodCode,
    paymentMethodCode: state.paymentMethodCode,
    couponCode: state.couponCode,
});

export interface UseOrderSummaryResult {
    summary: OrderSummary;
    isRecalculating: boolean;
}

// Reactive heart of the OPC: keys a syncCheckout query by the debounced checkout state.
// A distinct state maps to a distinct summary, so caching by key is race-safe — a stale
// response can never overwrite a newer one because it lands under a different key.
export const useOrderSummary = (
    token: string,
    state: CheckoutState,
    initialSummary: OrderSummary,
): UseOrderSummaryResult => {
    const queryClient = useQueryClient();
    const debouncedState = useDebouncedValue(state, DEBOUNCE_MS);

    // Seed the cache once, under the initial state's key, with the summary already fetched
    // on load. This must run during the first render (before useQuery reads the cache), so
    // the initial paint neither flashes a loading state nor re-requests an identical summary.
    // Scoping it to the initial key — instead of the `initialData` option, which React Query
    // applies to *every* key — is what lets later states actually fetch.
    useState(() => {
        queryClient.setQueryData(["checkout-summary", token, summaryKey(state)], initialSummary);
    });

    // The query key only tracks the debounced state, so isFetching stays false during the
    // debounce window even though the displayed summary is already stale. Treat that window
    // as recalculating too, so the UI locks from the instant a change is made until the
    // matching summary lands — otherwise the user could pay against not-yet-updated totals.
    const isDebouncing = JSON.stringify(summaryKey(state)) !== JSON.stringify(summaryKey(debouncedState));

    const query = useQuery({
        queryKey: ["checkout-summary", token, summaryKey(debouncedState)],
        queryFn: () => checkoutApi.syncCheckout(token, debouncedState),
        placeholderData: keepPreviousData,
        // State → summary is a pure sync, so a given state always yields the same summary;
        // caching each key indefinitely avoids redundant calls and layout flashes.
        staleTime: Infinity,
    });

    return {
        summary: query.data ?? initialSummary,
        isRecalculating: query.isFetching || isDebouncing,
    };
};
