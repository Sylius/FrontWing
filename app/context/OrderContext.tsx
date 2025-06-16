import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    pickupCartClient,
    fetchOrderFromAPIClient,
    updateOrderItemAPIClient,
    removeOrderItemAPIClient,
    setOrderAddressEmailAndAddressesAPIClient,
} from "~/api/order.client";
import type { Order } from "~/types/Order";
import { useCustomer } from "~/context/CustomerContext";

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
    resetCart: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const getCookieToken = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(^| )orderToken=([^;]+)/);
    return match ? decodeURIComponent(match[2]) : null;
};

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                           children,
                                                                       }) => {
    const queryClient = useQueryClient();
    const [orderToken, setOrderToken] = useState<string | null>(
        typeof window !== "undefined" ? getCookieToken() : null
    );
    const [activeCouponCode, setActiveCouponCode] = useState<string | null>(
        null
    );
    const { customer } = useCustomer();

    const resetCart = async () => {
        try {
            localStorage.removeItem("orderToken");
            document.cookie = "orderToken=; Max-Age=0; path=/";
            setOrderToken(null);

            const newToken = await pickupCartClient();
            if (newToken) {
                setOrderToken(newToken);
                localStorage.setItem("orderToken", newToken);
                document.cookie = `orderToken=${newToken}; path=/; max-age=2592000; SameSite=Lax`;
                await queryClient.invalidateQueries({ queryKey: ["order"] });
            }
        } catch (err) {
            console.error("[resetCart] Failed to reset cart:", err);
        }
    };

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

            try {
                return await fetchOrderFromAPIClient(token, true);
            } catch (error) {
                console.warn("[OrderContext] Failed to fetch order, resetting cart...");
                await resetCart();
                throw error;
            }
        },
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        const trySyncCustomerInfo = async () => {
            if (!orderQuery.data || !customer || !orderToken) return;

            const { billingAddress, shippingAddress } = orderQuery.data;

            if (!customer.email || !billingAddress) return;

            try {
                await setOrderAddressEmailAndAddressesAPIClient({
                    token: orderToken,
                    email: customer.email as string,
                    billingAddress: billingAddress as object,
                    shippingAddress: (shippingAddress ?? billingAddress) as object,
                });

                await queryClient.invalidateQueries({ queryKey: ["order"] });
            } catch (e) {
                console.warn("[OrderContext] Failed syncing customer email/address:", e);
            }
        };

        trySyncCustomerInfo();
    }, [customer, orderQuery.data, orderToken]);

    const updateMutation = useMutation({
        mutationFn: (vars: {
            id: number;
            quantity: number;
            token: string;
        }) => updateOrderItemAPIClient(vars),
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
