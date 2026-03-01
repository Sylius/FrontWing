import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useNavigate, useParams } from "react-router-dom";
import AddressForm from "../../components/account/AddressForm";
import { useFlashMessages } from "../../context/FlashMessagesContext";
import AccountLayout from "../../layouts/Account";
import Default from "../../layouts/Default";

interface Country {
    code: string;
    name: string;
}

const EditAddressPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { addMessage } = useFlashMessages();

    const [countries, setCountries] = useState<Country[]>([]);
    const [loadingCountries, setLoadingCountries] = useState(true);
    const [loadingAddress, setLoadingAddress] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

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
                const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/countries`);
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
                    `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/addresses/${id}`,
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
                addMessage("error", "Failed to load address");
            } finally {
                setLoadingAddress(false);
            }
        };

        fetchCountries();
        fetchAddress();
    }, [id, addMessage]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCountryChange = (value: string) => {
        setFormData((prev) => ({ ...prev, countryCode: value }));
    };

    const validate = (): boolean => {
        const e: Record<string, string> = {};
        if (!formData.firstName.trim()) e.firstName = "Required";
        if (!formData.lastName.trim()) e.lastName = "Required";
        if (!formData.street.trim()) e.street = "Required";
        if (!formData.city.trim()) e.city = "Required";
        if (!formData.postcode.trim()) e.postcode = "Required";
        if (!formData.countryCode.trim()) e.countryCode = "Required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        if (!validate()) return;
        setSubmitting(true);

        try {
            const token = localStorage.getItem("jwtToken");
            const res = await fetch(
                `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/addresses/${id}`,
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

            addMessage("success", "Address updated successfully");
            navigate("/account/address-book");
        } catch (error) {
            console.error("Error updating address", error);
            addMessage("error", "Failed to update address");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Default>
            <AccountLayout
                breadcrumbs={[
                    { label: "Home", url: "/" },
                    { label: "My account", url: "/account/dashboard" },
                    { label: "Address book", url: "/account/address-book" },
                    { label: "Edit", url: `/account/address-book/edit/${id}` },
                ]}
            >
                <div className="w-full md:w-3/4">
                    <div className="mb-4">
                        <h1>Address book</h1>
                        <p>Edit my address</p>
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
                                    onCountryChange={handleCountryChange}
                                    errors={errors}
                                    submitted={submitted}
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? "Saving..." : "Save changes"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/account/address-book")}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </AccountLayout>
        </Default>
    );
};

export default EditAddressPage;
