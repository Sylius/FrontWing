import React from "react";
import type { AddressInterface } from "~/types/Order";
import type { AddressFieldName, Country } from "~/modules/checkout-opc/types";

interface Props {
    idPrefix: string;
    address: AddressInterface;
    countries: Country[];
    onChange: (field: AddressFieldName, value: string) => void;
}

const AddressFields: React.FC<Props> = ({ idPrefix, address, countries, onChange }) => (
    <>
        <div className="row">
            <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor={`${idPrefix}-firstName`}>
                    First name
                </label>
                <input
                    id={`${idPrefix}-firstName`}
                    className="form-control"
                    value={address.firstName ?? ""}
                    onChange={(event) => onChange("firstName", event.target.value)}
                />
            </div>
            <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor={`${idPrefix}-lastName`}>
                    Last name
                </label>
                <input
                    id={`${idPrefix}-lastName`}
                    className="form-control"
                    value={address.lastName ?? ""}
                    onChange={(event) => onChange("lastName", event.target.value)}
                />
            </div>
        </div>

        <div className="mb-3">
            <label className="form-label" htmlFor={`${idPrefix}-company`}>
                Company
            </label>
            <input
                id={`${idPrefix}-company`}
                className="form-control"
                value={address.company ?? ""}
                onChange={(event) => onChange("company", event.target.value)}
            />
        </div>

        <div className="mb-3">
            <label className="form-label" htmlFor={`${idPrefix}-street`}>
                Street
            </label>
            <input
                id={`${idPrefix}-street`}
                className="form-control"
                value={address.street ?? ""}
                onChange={(event) => onChange("street", event.target.value)}
            />
        </div>

        <div className="row">
            <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor={`${idPrefix}-countryCode`}>
                    Country
                </label>
                <select
                    id={`${idPrefix}-countryCode`}
                    className="form-select"
                    value={address.countryCode ?? ""}
                    onChange={(event) => onChange("countryCode", event.target.value)}
                >
                    <option value="">Select</option>
                    {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                            {country.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor={`${idPrefix}-postcode`}>
                    Postcode
                </label>
                <input
                    id={`${idPrefix}-postcode`}
                    className="form-control"
                    value={address.postcode ?? ""}
                    onChange={(event) => onChange("postcode", event.target.value)}
                />
            </div>
        </div>

        <div className="mb-3">
            <label className="form-label" htmlFor={`${idPrefix}-city`}>
                City
            </label>
            <input
                id={`${idPrefix}-city`}
                className="form-control"
                value={address.city ?? ""}
                onChange={(event) => onChange("city", event.target.value)}
            />
        </div>

        <div className="mb-3">
            <label className="form-label" htmlFor={`${idPrefix}-phoneNumber`}>
                Phone
            </label>
            <input
                id={`${idPrefix}-phoneNumber`}
                className="form-control"
                value={address.phoneNumber ?? ""}
                onChange={(event) => onChange("phoneNumber", event.target.value)}
            />
        </div>
    </>
);

export default AddressFields;
