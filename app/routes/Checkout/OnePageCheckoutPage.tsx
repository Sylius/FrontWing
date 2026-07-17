import React from "react";
import { useQuery } from "@tanstack/react-query";
import CheckoutLayout from "~/layouts/Checkout";
import { useOrder } from "~/context/OrderContext";
import { checkoutApi } from "~/api/checkout/checkoutApi";
import ShippingMethodSection from "~/components/checkout/opc/ShippingMethodSection";
import AddressSection from "~/components/checkout/opc/AddressSection";
import PaymentMethodSection from "~/components/checkout/opc/PaymentMethodSection";
import SummaryPanel from "~/components/checkout/opc/SummaryPanel";
import FreeShippingCard from "~/components/checkout/opc/FreeShippingCard";

const OnePageCheckoutPage: React.FC = () => {
    const { orderToken } = useOrder();
    const token = orderToken ?? "";

    const addressesQuery = useQuery({
        queryKey: ["opc-addresses", token],
        queryFn: () => checkoutApi.getCheckoutAddresses(token),
    });

    const itemsQuery = useQuery({
        queryKey: ["opc-items", token],
        queryFn: () => checkoutApi.getCheckoutItems(token),
    });

    const summaryQuery = useQuery({
        queryKey: ["opc-summary", token],
        queryFn: () => checkoutApi.getOrderSummary(token),
    });

    const isPending = addressesQuery.isPending || itemsQuery.isPending || summaryQuery.isPending;
    const isError = addressesQuery.isError || itemsQuery.isError || summaryQuery.isError;
    const summary = summaryQuery.data;

    return (
        <CheckoutLayout sidebarOn={false}>
            <div className="col-12 pt-4 pb-5">
                <h1 className="h2 mb-4">Checkout</h1>

                {isPending && <div className="text-center py-5">Loading...</div>}

                {isError && (
                    <div className="text-danger py-5">Could not load the checkout. Please try again.</div>
                )}

                {!isPending && !isError && summary && (
                    <div className="row gx-5">
                        <div className="col-12 col-lg-8">
                            <ShippingMethodSection
                                methods={summary.shippingMethods}
                                selectedCode={summary.selectedShippingMethod}
                                currencyCode={summary.currencyCode}
                            />

                            <AddressSection addresses={addressesQuery.data ?? []} />

                            <PaymentMethodSection
                                methods={summary.paymentMethods}
                                selectedCode={summary.selectedPaymentMethod}
                            />
                        </div>

                        <div className="col-12 col-lg-4">
                            <div className="sticky-lg-top pt-2">
                                <SummaryPanel items={itemsQuery.data ?? []} summary={summary} />

                                {summary.freeShipping && (
                                    <FreeShippingCard
                                        freeShipping={summary.freeShipping}
                                        currencyCode={summary.currencyCode}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CheckoutLayout>
    );
};

export default OnePageCheckoutPage;
