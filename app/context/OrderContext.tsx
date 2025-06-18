import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    pickupCartClient,
    fetchOrderFromAPIClient,
    updateOrderItemAPIClient,
    removeOrderItemAPIClient,
} from "~/api/order.client";
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
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const getCookieToken = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(^| )orderToken=([^;]+)/);
    return match ? decodeURIComponent(match[2]) : null;
};

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();
    const [orderToken, setOrderToken] = useState<string | null>(
        typeof window !== "undefined" ? getCookieToken() : null
    );
    const [activeCouponCode, setActiveCouponCode] = useState<string | null>(null);

    const orderQuery = useQuery<Order, Error>({
        queryKey: ["order"],
        enabled: !!orderToken,
        queryFn: async () => {
            let token = orderToken;
            if (!token) {
                token = await pickupCartClient();
                setOrderToken(token);
                document.cookie = `orderToken=${token}; path=/; max-age=2592000; SameSite=Lax`;
            }
            if (!token) throw new Error("Missing order token");
            return await fetchOrderFromAPIClient(token, true);
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

    const updateOrderItem = (id: number, quantity: number) => {
        if (!orderToken) return;
        updateMutation.mutate({ id, quantity, token: orderToken });
    };

    const removeOrderItem = (id: number) => {
        if (!orderToken) return;
        removeMutation.mutate({ id, token: orderToken });
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
                fetchOrder: orderQuery.refetch,
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
