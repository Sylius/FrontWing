import React from "react";
import type { AddressInterface } from "~/types/Order";

interface Props {
    addresses: AddressInterface[];
}

const AddressSection: React.FC<Props> = ({ addresses }) => {
    const address: AddressInterface = addresses[0] ?? {};

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
                    value={address.email ?? ""}
                    readOnly
                />
            </div>

            {addresses.length > 0 && (
                <div className="mb-3">
                    <label className="form-label" htmlFor="opc-address-book">
                        Select address from my book
                    </label>
                    <select
                        id="opc-address-book"
                        className="form-select"
                        value={address.id ?? ""}
                        disabled
                    >
                        {addresses.map((entry) => (
                            <option key={entry.id} value={entry.id}>
                                {entry.firstName} {entry.lastName} — {entry.street}, {entry.city}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="opc-firstName">
                        First name
                    </label>
                    <input
                        id="opc-firstName"
                        className="form-control"
                        value={address.firstName ?? ""}
                        readOnly
                    />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="opc-lastName">
                        Last name
                    </label>
                    <input
                        id="opc-lastName"
                        className="form-control"
                        value={address.lastName ?? ""}
                        readOnly
                    />
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label" htmlFor="opc-company">
                    Company
                </label>
                <input
                    id="opc-company"
                    className="form-control"
                    value={address.company ?? ""}
                    readOnly
                />
            </div>

            <div className="mb-3">
                <label className="form-label" htmlFor="opc-street">
                    Street
                </label>
                <input
                    id="opc-street"
                    className="form-control"
                    value={address.street ?? ""}
                    readOnly
                />
            </div>

            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="opc-country">
                        Country
                    </label>
                    <input
                        id="opc-country"
                        className="form-control"
                        value={address.countryCode ?? ""}
                        readOnly
                    />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="opc-postcode">
                        Postcode
                    </label>
                    <input
                        id="opc-postcode"
                        className="form-control"
                        value={address.postcode ?? ""}
                        readOnly
                    />
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label" htmlFor="opc-city">
                    City
                </label>
                <input
                    id="opc-city"
                    className="form-control"
                    value={address.city ?? ""}
                    readOnly
                />
            </div>

            <div className="mb-4">
                <label className="form-label" htmlFor="opc-phone">
                    Phone
                </label>
                <input
                    id="opc-phone"
                    className="form-control"
                    value={address.phoneNumber ?? ""}
                    readOnly
                />
            </div>

            <div className="form-check">
                <input
                    id="opc-different-shipping"
                    type="checkbox"
                    className="form-check-input"
                    checked={false}
                    disabled
                    readOnly
                />
                <label className="form-check-label" htmlFor="opc-different-shipping">
                    Use a different address for shipping
                </label>
            </div>
        </fieldset>
    );
};

export default AddressSection;
