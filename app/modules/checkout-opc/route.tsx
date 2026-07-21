import React from "react";
import { useQuery } from "@tanstack/react-query";
import CheckoutLayout from "~/layouts/Checkout";
import { useOrder } from "~/context/OrderContext";
import { useCustomer } from "~/context/CustomerContext";
import { CheckoutProvider, createInitialCheckoutState } from "~/modules/checkout-opc/context/CheckoutContext";
import { checkoutApi } from "~/modules/checkout-opc/api/checkoutApi";
import CheckoutContent from "~/modules/checkout-opc/components/CheckoutContent";

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
                        <CheckoutContent
                            token={token}
                            addresses={addresses}
                            countries={countries}
                            items={items}
                            initialSummary={summary}
                        />
                    </CheckoutProvider>
                )}
            </div>
        </CheckoutLayout>
    );
};

export default OnePageCheckoutPage;
