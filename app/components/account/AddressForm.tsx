import React from "react";
import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";

interface AddressFormProps {
    formData: {
        firstName: string;
        lastName: string;
        company: string;
        street: string;
        countryCode: string;
        provinceName: string;
        city: string;
        postcode: string;
        phoneNumber: string;
    };
    countries: { code: string; name: string }[];
    loadingCountries: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ formData, countries, loadingCountries, onChange }) => {
    const { t } = useTranslation("account");

    return (
        <div className="row">
            <div className="col-12 col-md-6 mb-3">
                <label className="form-label">{t("addresses.form.firstName")}</label>
                <input
                    className="form-control"
                    name="firstName"
                    value={formData.firstName}
                    onChange={onChange}
                    required
                />
            </div>
            <div className="col-12 col-md-6 mb-3">
                <label className="form-label">{t("addresses.form.lastName")}</label>
                <input
                    className="form-control"
                    name="lastName"
                    value={formData.lastName}
                    onChange={onChange}
                    required
                />
            </div>
            <div className="col-12 mb-3">
                <label className="form-label">{t("addresses.form.company")}</label>
                <input className="form-control" name="company" value={formData.company} onChange={onChange} />
            </div>
            <div className="col-12 mb-3">
                <label className="form-label">{t("addresses.form.street")}</label>
                <input
                    className="form-control"
                    name="street"
                    value={formData.street}
                    onChange={onChange}
                    required
                />
            </div>
            <div className="col-12 mb-3">
                <label className="form-label">{t("addresses.form.country")}</label>
                {loadingCountries ? (
                    <Skeleton height={36} />
                ) : (
                    <select
                        className="form-select"
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={onChange}
                        required
                    >
                        <option value="" disabled>{t("addresses.form.select")}</option>
                        {countries.map((country) => (
                            <option key={country.code} value={country.code}>
                                {country.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>
            {formData.countryCode && (
                <div className="col-12 mb-3">
                    <label className="form-label">{t("addresses.form.province")}</label>
                    <input
                        className="form-control"
                        name="provinceName"
                        value={formData.provinceName}
                        onChange={onChange}
                    />
                </div>
            )}
            <div className="col-12 col-md-6 mb-3">
                <label className="form-label">{t("addresses.form.city")}</label>
                <input
                    className="form-control"
                    name="city"
                    value={formData.city}
                    onChange={onChange}
                    required
                />
            </div>
            <div className="col-12 col-md-6 mb-3">
                <label className="form-label">{t("addresses.form.postcode")}</label>
                <input
                    className="form-control"
                    name="postcode"
                    value={formData.postcode}
                    onChange={onChange}
                    required
                />
            </div>
            <div className="col-12 mb-3">
                <label className="form-label">{t("addresses.form.phoneNumber")}</label>
                <input
                    className="form-control"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={onChange}
                />
            </div>
        </div>
    );
};

export default AddressForm;
