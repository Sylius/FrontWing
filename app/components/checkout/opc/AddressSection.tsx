import React from "react";
import type { AddressInterface } from "~/types/Order";
import type { Country } from "~/types/Checkout";
import { useCheckout } from "~/context/CheckoutContext";
import AddressBookSelect from "./AddressBookSelect";
import AddressFields from "./AddressFields";

interface Props {
    addresses: AddressInterface[];
    countries: Country[];
}

const AddressSection: React.FC<Props> = ({ addresses, countries }) => {
    const { state, setEmail, setAddressField, selectAddress, setUseDifferentShipping } =
        useCheckout();

    return (
        <fieldset className="mb-5">
            <legend className="h5 mb-4">Address</legend>

            <div className="mb-3">
                <label className="form-label" htmlFor="opc-email">
                    Email
                </label>
                <input
                    id="opc-email"
                    type="email"
                    className="form-control"
                    placeholder="your@email.com"
                    value={state.email}
                    onChange={(event) => setEmail(event.target.value)}
                />
            </div>

            {state.useDifferentShipping && <div className="h6 mb-3">Billing address</div>}

            <AddressBookSelect
                id="opc-billing-book"
                label="Select address from my book"
                addresses={addresses}
                selectedId={state.billingAddress.id}
                onSelect={(address) => selectAddress("billing", address)}
            />

            <AddressFields
                idPrefix="opc-billing"
                address={state.billingAddress}
                countries={countries}
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
                    Use a different address for shipping
                </label>
            </div>

            {state.useDifferentShipping && (
                <div className="mt-4">
                    <div className="h6 mb-3">Shipping address</div>

                    <AddressBookSelect
                        id="opc-shipping-book"
                        label="Select address from my book"
                        addresses={addresses}
                        selectedId={state.shippingAddress.id}
                        onSelect={(address) => selectAddress("shipping", address)}
                    />

                    <AddressFields
                        idPrefix="opc-shipping"
                        address={state.shippingAddress}
                        countries={countries}
                        onChange={(field, value) => setAddressField("shipping", field, value)}
                    />
                </div>
            )}
        </fieldset>
    );
};

export default AddressSection;
