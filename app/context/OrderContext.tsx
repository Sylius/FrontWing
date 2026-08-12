import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchOrderFromAPIClient,
    updateOrderItemAPIClient,
    removeOrderItemAPIClient,
    OrderFetchError,
} from "~/api/order.client";
import {
    readOrderToken,
    serializeOrderToken,
    clearOrderTokenCookie,
} from "~/utils/orderTokenCookie";
import type { Order } from "~/types/Order";

interface OrderContextType {
    order: Order | null;
    isFetching: boolean;
    orderToken: string | null;
    setOrderToken: (token: string | null) => void;
    updateOrderItem: (id: number, quantity: number) => void;
    removeOrderItem: (id: number) => void;
    activeCouponCode: string | null;
    setActiveCouponCode: (code: string | null) => void;
    fetchOrder: () => void;
    resetCart: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();
    const [orderToken, setOrderToken] = useState<string | null>(null);
    const [activeCouponCode, setActiveCouponCode] = useState<string | null>(null);
    const bootstrappedRef = useRef(false);
    const creatingRef = useRef(false);

    const createNewOrder = async (reason?: string) => {
        if (creatingRef.current) return;
        creatingRef.current = true;

        try {
            const response = await fetch(`${window.ENV?.API_URL}/api/v2/shop/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: "{}",
            });

            if (!response.ok) throw new Error("Failed to create new cart");

            const order = await response.json();
            if (!order?.tokenValue) throw new Error("Missing tokenValue in order response");

            const newToken = order.tokenValue;
            document.cookie = serializeOrderToken(newToken);
            setOrderToken(newToken);

            await fetch("/api/sync-cart", {
                method: "POST",
                body: newToken,
            });
        } catch (e) {
            console.error("Could not create a new order:", e);
        } finally {
            creatingRef.current = false;
        }
    };

    useEffect(() => {
        if (bootstrappedRef.current) return;
        bootstrappedRef.current = true;

        const remixToken =
            typeof window !== "undefined"
                ? (window as unknown as { __remixOrderToken?: string }).__remixOrderToken ?? null
                : null;
        const cookieToken = typeof document !== "undefined" ? readOrderToken(document.cookie) : null;
        const initialToken = remixToken || cookieToken;

        if (initialToken) {
            setOrderToken(initialToken);
        } else {
            createNewOrder("bootstrap: no initial token");
        }
    }, []);

    const orderQuery = useQuery<Order, Error>({
        queryKey: ["order", orderToken],
        enabled: !!orderToken,
        queryFn: async () => {
            if (!orderToken) throw new Error("Missing order token");
            return await fetchOrderFromAPIClient(orderToken, true);
        },
        refetchOnWindowFocus: false,
    });

    const updateMutation = useMutation({
        mutationFn: (vars: { id: number; quantity: number; token: string }) =>
            updateOrderItemAPIClient(vars),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["order"] }),
    });

    const removeMutation = useMutation({
        mutationFn: (vars: { id: number; token: string }) =>
            removeOrderItemAPIClient(vars),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["order"] }),
    });

    useEffect(() => {
        const data = orderQuery.data;
        if (data) {
            if (data.promotionCoupon?.code) {
                setActiveCouponCode(data.promotionCoupon.code);
            } else if (data.orderPromotionTotal !== 0) {
                setActiveCouponCode("__USED__");
            } else {
                setActiveCouponCode(null);
            }
        }
    }, [orderQuery.data]);

    useEffect(() => {
        if (orderQuery.data?.checkoutState === "completed") {
            createNewOrder("order completed");
        }
    }, [orderQuery.data]);

    useEffect(() => {
        const error = orderQuery.error;
        if (!error) return;
        const status = error instanceof OrderFetchError ? error.status : null;
        if (status === 404) {
            createNewOrder("order fetch 404");
        }
    }, [orderQuery.error]);

    const updateOrderItem = (id: number, quantity: number) => {
        if (!orderToken) return;
        updateMutation.mutate({ id, quantity, token: orderToken });
    };

    const removeOrderItem = (id: number) => {
        if (!orderToken) return;
        removeMutation.mutate({ id, token: orderToken });
    };

    const fetchOrder = () => {
        if (!orderToken) return;
        queryClient.invalidateQueries({ queryKey: ["order", orderToken] });
    };

    const resetCart = () => {
        queryClient.removeQueries({ queryKey: ["order"] });
        setOrderToken(null);
        setActiveCouponCode(null);
        document.cookie = clearOrderTokenCookie();
        createNewOrder("resetCart");
    };

    return (
        <OrderContext.Provider
            value={{
                order: orderQuery.data ?? null,
                isFetching: orderQuery.isFetching,
                orderToken,
                setOrderToken,
                updateOrderItem,
                removeOrderItem,
                activeCouponCode,
                setActiveCouponCode,
                fetchOrder,
                resetCart,
            }}
        >
            {children}
        </OrderContext.Provider>
    );
};

export const useOrder = (): OrderContextType => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error("useOrder must be used within an OrderProvider");
    }
    return context;
};
