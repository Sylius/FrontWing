import React from "react";
import { useTranslation } from "react-i18next";
import type { AddressInterface } from "~/types/Order";
import type { AddressFieldName, Country } from "~/modules/checkout-opc/types";

interface Props {
    idPrefix: string;
    address: AddressInterface;
    countries: Country[];
    onChange: (field: AddressFieldName, value: string) => void;
}

const AddressFields: React.FC<Props> = ({ idPrefix, address, countries, onChange }) => {
    const { t } = useTranslation("checkout");

    return (
        <>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor={`${idPrefix}-firstName`}>
                        {t("opc.address.firstName")}
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
                        {t("opc.address.lastName")}
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
                    {t("opc.address.company")}
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
                    {t("opc.address.street")}
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
                        {t("opc.address.country")}
                    </label>
                    <select
                        id={`${idPrefix}-countryCode`}
                        className="form-select"
                        value={address.countryCode ?? ""}
                        onChange={(event) => onChange("countryCode", event.target.value)}
                    >
                        <option value="">{t("opc.address.selectCountry")}</option>
                        {countries.map((country) => (
                            <option key={country.code} value={country.code}>
                                {country.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor={`${idPrefix}-postcode`}>
                        {t("opc.address.postcode")}
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
                <label className="form-label" htmlFor={`${idPrefix}-provinceName`}>
                    {t("opc.address.province")}
                </label>
                <input
                    id={`${idPrefix}-provinceName`}
                    className="form-control"
                    value={address.provinceName ?? ""}
                    onChange={(event) => onChange("provinceName", event.target.value)}
                />
            </div>

            <div className="mb-3">
                <label className="form-label" htmlFor={`${idPrefix}-city`}>
                    {t("opc.address.city")}
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
                    {t("opc.address.phone")}
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
};

export default AddressFields;
