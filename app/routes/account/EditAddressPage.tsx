export const handle = { i18n: ["common","cart","account"] };

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { useLocalizedNavigate } from "~/hooks/useLocalizedNavigate";
import Default from "../../layouts/Default";
import AccountLayout from "../../layouts/Account";
import Skeleton from "react-loading-skeleton";
import { useFlashMessages } from "../../context/FlashMessagesContext";
import AddressForm from "../../components/account/AddressForm";

interface Country {
    code: string;
    name: string;
}

const EditAddressPage: React.FC = () => {
    const { t } = useTranslation(["account", "common"]);
    const navigate = useLocalizedNavigate();
    const { id } = useParams<{ id: string }>();
    const { addMessage } = useFlashMessages();

    const [countries, setCountries] = useState<Country[]>([]);
    const [loadingCountries, setLoadingCountries] = useState(true);
    const [loadingAddress, setLoadingAddress] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        company: "",
        street: "",
        countryCode: "",
        provinceName: "",
        city: "",
        postcode: "",
        phoneNumber: "",
    });

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await fetch(`${window.ENV?.API_URL}/api/v2/shop/countries`);
                const data = await res.json();
                setCountries(data["hydra:member"] || []);
            } catch (error) {
                console.error("Error fetching countries", error);
            } finally {
                setLoadingCountries(false);
            }
        };

        const fetchAddress = async () => {
            try {
                const token = localStorage.getItem("jwtToken");
                const res = await fetch(
                    `${window.ENV?.API_URL}/api/v2/shop/addresses/${id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (!res.ok) throw new Error("Failed to fetch address");
                const data = await res.json();
                setFormData({
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    company: data.company || "",
                    street: data.street || "",
                    countryCode: data.countryCode || "",
                    provinceName: data.provinceName || "",
                    city: data.city || "",
                    postcode: data.postcode || "",
                    phoneNumber: data.phoneNumber || "",
                });
            } catch (err) {
                console.error("Error loading address", err);
                addMessage("error", t("addresses.edit.loadError"));
            } finally {
                setLoadingAddress(false);
            }
        };

        fetchCountries();
        fetchAddress();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem("jwtToken");
            const res = await fetch(
                `${window.ENV?.API_URL}/api/v2/shop/addresses/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (!res.ok) throw new Error("Failed to update address");

            addMessage("success", t("addresses.edit.updateSuccess"));
            navigate("/account/address-book");
        } catch (error) {
            console.error("Error updating address", error);
            addMessage("error", t("addresses.edit.updateError"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Default>
            <AccountLayout
                breadcrumbs={[
                    { label: t("common:nav.home"), url: "/" },
                    { label: t("common:nav.account"), url: "/account/dashboard" },
                    { label: t("addresses.breadcrumb"), url: "/account/address-book" },
                    { label: t("addresses.edit.breadcrumb"), url: `/account/address-book/edit/${id}` },
                ]}
            >
                <div className="col-12 col-md-9">
                    <div className="mb-4">
                        <h1>{t("addresses.edit.title")}</h1>
                        <p>{t("addresses.edit.subtitle")}</p>
                    </div>

                    {loadingAddress ? (
                        <Skeleton count={10} height={36} className="mb-2" />
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <AddressForm
                                    formData={formData}
                                    countries={countries}
                                    loadingCountries={loadingCountries}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? t("addresses.edit.submitting") : t("addresses.edit.submit")}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-gray"
                                    onClick={() => navigate("/account/address-book")}
                                >
                                    {t("addresses.edit.cancel")}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </AccountLayout>
        </Default>
    );
};

export default EditAddressPage;
