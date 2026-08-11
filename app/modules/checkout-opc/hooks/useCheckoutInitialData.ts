import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useOrder } from "~/context/OrderContext";
import { useCustomer } from "~/context/CustomerContext";
import { createInitialCheckoutState } from "~/modules/checkout-opc/context/CheckoutContext";
import { checkoutApi } from "~/modules/checkout-opc/api/checkoutApi";
import { mapOrderItemsToLineItems } from "~/modules/checkout-opc/api/previewCheckout";
import { summaryKey } from "~/modules/checkout-opc/hooks/useOrderSummary";
import { loadPersistedCheckoutState } from "~/modules/checkout-opc/utils/checkoutStatePersistence";
import { useLocalizedNavigate } from "~/hooks/useLocalizedNavigate";
import type { AddressInterface } from "~/types/Order";
import type {
    CheckoutState,
    Country,
    OrderLineItem,
    OrderSummary,
} from "~/modules/checkout-opc/types";

export interface CheckoutInitialData {
    token: string;
    isPending: boolean;
    isError: boolean;
    isEmptyOrder: boolean;
    isReady: boolean;
    addresses?: AddressInterface[];
    countries?: Country[];
    items: OrderLineItem[];
    initialSummary: OrderSummary | null;
    initialState: CheckoutState | null;
    currencyCode?: string;
}

export const useCheckoutInitialData = (): CheckoutInitialData => {
    const { order, isFetching: orderFetching } = useOrder();
    const { customer, loading: customerLoading } = useCustomer();
    const navigate = useLocalizedNavigate();
    const token = order?.tokenValue ?? "";

    const isEmptyOrder = !!order && (order.items?.length ?? 0) === 0;

    useEffect(() => {
        if (!orderFetching && isEmptyOrder) {
            navigate("/cart", { replace: true });
        }
    }, [orderFetching, isEmptyOrder, navigate]);

    const countriesQuery = useQuery({
        queryKey: ["opc-countries"],
        queryFn: () => checkoutApi.getCountries(),
        staleTime: Infinity,
    });

    const addressesQuery = useQuery({
        queryKey: ["opc-addresses"],
        queryFn: () => checkoutApi.getCheckoutAddresses(token),
    });

    const addresses = addressesQuery.data;
    const items = useMemo(() => mapOrderItemsToLineItems(order), [order]);

    const initialState = useMemo<CheckoutState | null>(() => {
        if (!order || addressesQuery.isPending || !addresses) return null;
        return (
            loadPersistedCheckoutState(token) ??
            createInitialCheckoutState({ addresses, items, email: customer?.email })
        );
    }, [order, addressesQuery.isPending, addresses, items, token, customer?.email]);

    const previewQuery = useQuery({
        queryKey: ["opc-initial-preview", token, initialState ? summaryKey(initialState) : null],
        queryFn: () => checkoutApi.syncCheckout(token, initialState!),
        enabled: !!token && !!initialState,
        gcTime: 0,
    });

    const isPending =
        orderFetching ||
        customerLoading ||
        !order ||
        countriesQuery.isPending ||
        addressesQuery.isPending ||
        previewQuery.isPending;
    const isError = countriesQuery.isError || addressesQuery.isError || previewQuery.isError;

    const countries = countriesQuery.data;
    const preview = previewQuery.data;
    const isReady =
        !isPending && !isError && !!order && !!addresses && !!countries && !!preview && !!initialState;

    const initialSummary = useMemo<OrderSummary | null>(() => {
        if (!preview || !order) return null;
        const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
        return {
            ...preview,
            currencyCode: order.currencyCode,
            totals: { ...preview.totals, itemsCount },
        };
    }, [preview, order, items]);

    return {
        token,
        isPending,
        isError,
        isEmptyOrder,
        isReady,
        addresses,
        countries,
        items,
        initialSummary,
        initialState,
        currencyCode: order?.currencyCode,
    };
};
