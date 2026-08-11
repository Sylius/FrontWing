import React from "react";
import { useTranslation } from "react-i18next";
import type { AddressInterface } from "~/types/Order";
import type { Country } from "~/modules/checkout-opc/types";
import { useCheckout } from "~/modules/checkout-opc/context/CheckoutContext";
import { useCustomer } from "~/context/CustomerContext";
import AddressBook from "./AddressBook";

interface Props {
    addresses: AddressInterface[];
    countries: Country[];
}

const AddressSection: React.FC<Props> = ({ addresses, countries }) => {
    const { state, setEmail, setAddressField, selectAddress, setUseDifferentShipping } =
        useCheckout();
    const { customer, loading: customerLoading } = useCustomer();
    const { t } = useTranslation("checkout");
    const showEmailField = !customerLoading && !customer;

    return (
        <fieldset className="mb-5">
            <legend className="h5 mb-4">{t("opc.address.legend")}</legend>

            {showEmailField && (
                <div className="mb-3">
                    <label className="form-label" htmlFor="opc-email">
                        {t("opc.address.email")}
                    </label>
                    <input
                        id="opc-email"
                        type="email"
                        className="form-control"
                        placeholder={t("opc.address.emailPlaceholder")}
                        value={state.email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </div>
            )}

            {state.useDifferentShipping && (
                <div className="h6 mb-3">{t("opc.address.billingAddress")}</div>
            )}

            <AddressBook
                idPrefix="opc-billing"
                addresses={addresses}
                countries={countries}
                address={state.billingAddress}
                onSelect={(address) => selectAddress("billing", address)}
                onChange={(field, value) => setAddressField("billing", field, value)}
            />

            <div className="form-check">
                <input
                    id="opc-different-shipping"
                    type="checkbox"
                    className="form-check-input"
                    checked={state.useDifferentShipping}
                    onChange={(event) => setUseDifferentShipping(event.target.checked)}
                />
                <label className="form-check-label" htmlFor="opc-different-shipping">
                    {t("opc.address.useDifferentShipping")}
                </label>
            </div>

            {state.useDifferentShipping && (
                <div className="mt-4">
                    <div className="h6 mb-3">{t("opc.address.shippingAddress")}</div>

                    <AddressBook
                        idPrefix="opc-shipping"
                        addresses={addresses}
                        countries={countries}
                        address={state.shippingAddress}
                        onSelect={(address) => selectAddress("shipping", address)}
                        onChange={(field, value) => setAddressField("shipping", field, value)}
                    />
                </div>
            )}
        </fieldset>
    );
};

export default AddressSection;
