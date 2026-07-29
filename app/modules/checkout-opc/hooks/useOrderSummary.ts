import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { checkoutApi } from "~/modules/checkout-opc/api/checkoutApi";
import type { CheckoutState, OrderSummary } from "~/modules/checkout-opc/types";
import { useDebouncedValue } from "./useDebouncedValue";

const DEBOUNCE_MS = 400;

export const summaryKey = (state: CheckoutState) => ({
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
    hash: string | undefined;
}

export const useOrderSummary = (
    token: string,
    state: CheckoutState,
    initialSummary: OrderSummary,
    currencyCode: string,
): UseOrderSummaryResult => {
    const queryClient = useQueryClient();
    const debouncedState = useDebouncedValue(state, DEBOUNCE_MS);

    useState(() => {
        queryClient.setQueryData(["checkout-summary", token, summaryKey(state)], initialSummary);
    });

    const isDebouncing = JSON.stringify(summaryKey(state)) !== JSON.stringify(summaryKey(debouncedState));

    const query = useQuery({
        queryKey: ["checkout-summary", token, summaryKey(debouncedState)],
        queryFn: () => checkoutApi.syncCheckout(token, debouncedState),
        enabled: !!token,
        placeholderData: keepPreviousData,
        staleTime: Infinity,
    });

    const summary = query.data ?? initialSummary;

    return {
        summary: summary.currencyCode === currencyCode ? summary : { ...summary, currencyCode },
        isRecalculating: query.isFetching || isDebouncing,
        hash: summary.hash,
    };
};
