import React, { useEffect, useMemo } from "react";
import type { AddressInterface } from "~/types/Order";
import type { Country, OrderLineItem, OrderSummary } from "~/modules/checkout-opc/types";
import { useCheckout } from "~/modules/checkout-opc/context/CheckoutContext";
import { applyItemPricing } from "~/modules/checkout-opc/api/previewCheckout";
import { useOrderSummary } from "~/modules/checkout-opc/hooks/useOrderSummary";
import { useMethodReconciliation } from "~/modules/checkout-opc/hooks/useMethodReconciliation";
import { useCheckoutSubmit } from "~/modules/checkout-opc/hooks/useCheckoutSubmit";
import { canSubmitCheckout } from "~/modules/checkout-opc/utils/checkoutValidation";
import { savePersistedCheckoutState } from "~/modules/checkout-opc/utils/checkoutStatePersistence";
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
    currencyCode: string;
}

const CheckoutContent: React.FC<Props> = ({
    token,
    addresses,
    countries,
    items,
    initialSummary,
    currencyCode,
}) => {
    const { state, setItems } = useCheckout();
    const { summary, isRecalculating, hash } = useOrderSummary(
        token,
        state,
        initialSummary,
        currencyCode,
    );
    const { submit, isSubmitting, errorMessage } = useCheckoutSubmit(token);
    const { shippingSectionRef, shippingMethodsChanged } = useMethodReconciliation(summary);

    const displayItems = useMemo(
        () => applyItemPricing(items, summary.items),
        [items, summary.items],
    );

    useEffect(() => {
        savePersistedCheckoutState(token, state);
    }, [state, token]);

    useEffect(() => {
        setItems(items.map(({ id, quantity }) => ({ id, quantity })));
    }, [items, setItems]);

    const canPay = canSubmitCheckout(state, isRecalculating) && !!hash && !isSubmitting;

    const handlePay = () => {
        if (!canPay || !hash) return;
        submit(state, hash);
    };

    return (
        <div className="row gx-5">
            <div className="col-12 col-lg-8">
                <div ref={shippingSectionRef}>
                    <ShippingMethodSection
                        methods={summary.shippingMethods}
                        currencyCode={summary.currencyCode}
                        changedNotice={shippingMethodsChanged}
                    />
                </div>

                <AddressSection addresses={addresses} countries={countries} />

                <PaymentMethodSection methods={summary.paymentMethods} />
            </div>

            <div className="col-12 col-lg-4">
                <div className="sticky-lg-top pt-2 checkout-summary-sticky">
                    <SummaryPanel
                        items={displayItems}
                        summary={summary}
                        recalculating={isRecalculating}
                        canPay={canPay}
                        submitting={isSubmitting}
                        errorMessage={errorMessage}
                        onPay={handlePay}
                    />
                </div>
            </div>
        </div>
    );
};

export default CheckoutContent;
