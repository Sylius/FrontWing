import React from "react";
import CheckoutLayout from "~/layouts/Checkout";
import { CheckoutProvider } from "~/modules/checkout-opc/context/CheckoutContext";
import { useCheckoutInitialData } from "~/modules/checkout-opc/hooks/useCheckoutInitialData";
import CheckoutContent from "~/modules/checkout-opc/components/CheckoutContent";

const OnePageCheckoutPage: React.FC = () => {
    const {
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
        currencyCode,
    } = useCheckoutInitialData();

    return (
        <CheckoutLayout sidebarOn={false}>
            <div className="col-12 pt-4 pb-5">
                <h1 className="h2 mb-4">Checkout</h1>

                {(isPending || isEmptyOrder) && <div className="text-center py-5">Loading...</div>}

                {isError && (
                    <div className="text-danger py-5">Could not load the checkout. Please try again.</div>
                )}

                {!isEmptyOrder &&
                    isReady &&
                    initialSummary &&
                    initialState &&
                    addresses &&
                    countries &&
                    currencyCode && (
                        <CheckoutProvider initialState={initialState}>
                            <CheckoutContent
                                token={token}
                                addresses={addresses}
                                countries={countries}
                                items={items}
                                initialSummary={initialSummary}
                                currencyCode={currencyCode}
                            />
                        </CheckoutProvider>
                    )}
            </div>
        </CheckoutLayout>
    );
};

export default OnePageCheckoutPage;
