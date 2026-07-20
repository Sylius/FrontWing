import React from "react";
import { useQuery } from "@tanstack/react-query";
import CheckoutLayout from "~/layouts/Checkout";
import { useOrder } from "~/context/OrderContext";
import { useCustomer } from "~/context/CustomerContext";
import { CheckoutProvider, createInitialCheckoutState } from "~/context/CheckoutContext";
import { checkoutApi } from "~/api/checkout/checkoutApi";
import ShippingMethodSection from "~/components/checkout/opc/ShippingMethodSection";
import AddressSection from "~/components/checkout/opc/AddressSection";
import PaymentMethodSection from "~/components/checkout/opc/PaymentMethodSection";
import SummaryPanel from "~/components/checkout/opc/SummaryPanel";
import FreeShippingCard from "~/components/checkout/opc/FreeShippingCard";

const OnePageCheckoutPage: React.FC = () => {
    const { orderToken } = useOrder();
    const { customer, loading: customerLoading } = useCustomer();
    const token = orderToken ?? "";

    const addressesQuery = useQuery({
        queryKey: ["opc-addresses", token],
        queryFn: () => checkoutApi.getCheckoutAddresses(token),
    });

    const countriesQuery = useQuery({
        queryKey: ["opc-countries"],
        queryFn: () => checkoutApi.getCountries(),
        staleTime: Infinity,
    });

    const itemsQuery = useQuery({
        queryKey: ["opc-items", token],
        queryFn: () => checkoutApi.getCheckoutItems(token),
    });

    const summaryQuery = useQuery({
        queryKey: ["opc-summary", token],
        queryFn: () => checkoutApi.getOrderSummary(token),
    });

    const isPending =
        customerLoading ||
        addressesQuery.isPending ||
        countriesQuery.isPending ||
        itemsQuery.isPending ||
        summaryQuery.isPending;
    const isError =
        addressesQuery.isError ||
        countriesQuery.isError ||
        itemsQuery.isError ||
        summaryQuery.isError;

    const addresses = addressesQuery.data;
    const countries = countriesQuery.data;
    const items = itemsQuery.data;
    const summary = summaryQuery.data;
    const isReady = !isPending && !isError && !!addresses && !!countries && !!items && !!summary;

    return (
        <CheckoutLayout sidebarOn={false}>
            <div className="col-12 pt-4 pb-5">
                <h1 className="h2 mb-4">Checkout</h1>

                {isPending && <div className="text-center py-5">Loading...</div>}

                {isError && (
                    <div className="text-danger py-5">Could not load the checkout. Please try again.</div>
                )}

                {isReady && (
                    <CheckoutProvider
                        initialState={createInitialCheckoutState({
                            addresses,
                            items,
                            summary,
                            email: customer?.email,
                        })}
                    >
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
                                <div className="sticky-lg-top pt-2">
                                    <SummaryPanel items={items} summary={summary} />

                                    {summary.freeShipping && (
                                        <FreeShippingCard
                                            freeShipping={summary.freeShipping}
                                            currencyCode={summary.currencyCode}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </CheckoutProvider>
                )}
            </div>
        </CheckoutLayout>
    );
};

export default OnePageCheckoutPage;
