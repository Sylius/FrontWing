import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalizedNavigate } from "~/hooks/useLocalizedNavigate";
import Default from "../../layouts/Default";
import AccountLayout from "../../layouts/Account";
import { useFlashMessages } from "../../context/FlashMessagesContext";
import AddressForm from "../../components/account/AddressForm";

interface Country {
    code: string;
    name: string;
}

const AddAddressPage: React.FC = () => {
    const { t } = useTranslation(["account", "common"]);
    const navigate = useLocalizedNavigate();
    const { addMessage } = useFlashMessages();

    const [countries, setCountries] = useState<Country[]>([]);
    const [loadingCountries, setLoadingCountries] = useState(true);
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
    const [submitting, setSubmitting] = useState(false);

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

        fetchCountries();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem("jwtToken");
            if (!token) throw new Error("Missing token");

            const res = await fetch(`${window.ENV?.API_URL}/api/v2/shop/addresses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to add address");

            addMessage("success", t("addresses.add.addSuccess"));
            navigate("/account/address-book");
        } catch (error) {
            console.error("Error submitting address", error);
            addMessage("error", t("addresses.add.addError"));
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
                    { label: t("addresses.add.breadcrumb"), url: "/account/address-book/create" },
                ]}
            >
                <div className="col-12 col-md-9">
                    <div className="mb-4">
                        <h1>{t("addresses.add.title")}</h1>
                        <p>{t("addresses.add.subtitle")}</p>
                    </div>

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
                                {submitting ? t("addresses.add.submitting") : t("addresses.add.submit")}
                            </button>
                            <button type="button" className="btn btn-outline-gray" onClick={() => navigate("/account/address-book")}>
                                {t("addresses.add.cancel")}
                            </button>
                        </div>
                    </form>
                </div>
            </AccountLayout>
        </Default>
    );
};

export default AddAddressPage;
