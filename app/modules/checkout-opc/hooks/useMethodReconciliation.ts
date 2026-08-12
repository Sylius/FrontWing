import { useEffect, useRef, useState } from "react";
import type { OrderSummary } from "~/modules/checkout-opc/types";
import { useCheckout } from "~/modules/checkout-opc/context/CheckoutContext";

export const useMethodReconciliation = (summary: OrderSummary) => {
    const { state, setShippingMethod, setPaymentMethod } = useCheckout();
    const shippingSectionRef = useRef<HTMLDivElement>(null);
    const [shippingMethodsChanged, setShippingMethodsChanged] = useState(false);

    useEffect(() => {
        if (
            state.shippingMethodCode &&
            !summary.shippingMethods.some((m) => m.code === state.shippingMethodCode && m.enabled)
        ) {
            setShippingMethod(null);
            setShippingMethodsChanged(true);
        }
    }, [summary, state.shippingMethodCode, setShippingMethod]);

    useEffect(() => {
        if (state.shippingMethodCode) {
            setShippingMethodsChanged(false);
        }
    }, [state.shippingMethodCode]);

    useEffect(() => {
        if (shippingMethodsChanged) {
            shippingSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [shippingMethodsChanged]);

    useEffect(() => {
        if (
            state.paymentMethodCode &&
            !summary.paymentMethods.some((m) => m.code === state.paymentMethodCode && m.enabled)
        ) {
            setPaymentMethod(null);
        }
    }, [summary, state.paymentMethodCode, setPaymentMethod]);

    return { shippingSectionRef, shippingMethodsChanged };
};
