import React, { useEffect } from "react";
import type { AddressInterface } from "~/types/Order";
import type { Country, OrderLineItem, OrderSummary } from "~/types/Checkout";
import { useCheckout } from "~/context/CheckoutContext";
import { useOrderSummary } from "~/hooks/useOrderSummary";
import { canSubmitCheckout } from "~/utils/checkoutValidation";
import ShippingMethodSection from "./ShippingMethodSection";
import AddressSection from "./AddressSection";
import PaymentMethodSection from "./PaymentMethodSection";
import SummaryPanel from "./SummaryPanel";

interface Props {
    token: string;
    addresses: AddressInterface[];
    countries: Country[];
    items: OrderLineItem[];
    initialSummary: OrderSummary;
}

// Lives inside CheckoutProvider so it can read state and drive the reactive summary.
// The parent page renders the provider, so it cannot call useCheckout() itself.
const CheckoutContent: React.FC<Props> = ({ token, addresses, countries, items, initialSummary }) => {
    const { state, setShippingMethod, setPaymentMethod } = useCheckout();
    const { summary, isRecalculating } = useOrderSummary(token, state, initialSummary);

    // §5.4 — methods are server-driven and may disappear (e.g. a courier that no longer
    // serves the chosen country). If the selected method is gone, clear the stale choice.
    useEffect(() => {
        if (
            state.shippingMethodCode &&
            !summary.shippingMethods.some((m) => m.code === state.shippingMethodCode && m.enabled)
        ) {
            setShippingMethod(null);
        }
    }, [summary, state.shippingMethodCode, setShippingMethod]);

    useEffect(() => {
        if (
            state.paymentMethodCode &&
            !summary.paymentMethods.some((m) => m.code === state.paymentMethodCode && m.enabled)
        ) {
            setPaymentMethod(null);
        }
    }, [summary, state.paymentMethodCode, setPaymentMethod]);

    const canPay = canSubmitCheckout(state, isRecalculating);

    return (
        <div className="row gx-5">
            <div className="col-12 col-lg-8">
                <ShippingMethodSection
                    methods={summary.shippingMethods}
                    currencyCode={summary.currencyCode}
                />

                <AddressSection addresses={addresses} countries={countries} />

                <PaymentMethodSection methods={summary.paymentMethods} />
            </div>

            <div className="col-12 col-lg-4">
                <div className="sticky-lg-top pt-2 checkout-summary-sticky">
                    <SummaryPanel
                        items={items}
                        summary={summary}
                        recalculating={isRecalculating}
                        canPay={canPay}
                    />
                </div>
            </div>
        </div>
    );
};

export default CheckoutContent;
