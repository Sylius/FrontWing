import React, { useEffect, useState } from "react";
import Default from "../../layouts/Default";
import AccountLayout from "../../layouts/Account";
import { useCustomer } from "../../context/CustomerContext";
import { useFlashMessages } from "../../context/FlashMessagesContext";
import Skeleton from "react-loading-skeleton";

const ProfilePage: React.FC = () => {
    const { customer, refetchCustomer } = useCustomer();
    const { addMessage } = useFlashMessages();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        birthday: "",
        gender: "u",
        phoneNumber: "",
        subscribedToNewsletter: false,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!customer) return;

        setFormData({
            firstName: customer.firstName ?? "",
            lastName: customer.lastName ?? "",
            email: customer.email ?? "",
            birthday: customer.birthday?.split(" ")[0] ?? "",
            gender: customer.gender ?? "u",
            phoneNumber: customer.phoneNumber ?? "",
            subscribedToNewsletter: customer.subscribedToNewsletter ?? false,
        });
        setLoading(false);
    }, [customer]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        const newValue =
            type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

        setFormData((prev) => ({ ...prev, [name]: newValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(
                `${window.ENV?.API_URL}${customer?.["@id"]}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
                    },
                    body: JSON.stringify({
                        ...formData,
                        user: {
                            username: formData.email,
                            enabled: true,
                        },
                    }),
                }
            );

            if (!res.ok) throw new Error("Failed to update profile");

            await refetchCustomer();
            addMessage("success", "Profile updated successfully");
        } catch (err) {
            addMessage("error", "Error updating profile");
            console.error(err);
        }
    };

    return (
        <Default>
            <AccountLayout
                breadcrumbs={[
                    { label: "Home", url: "/" },
                    { label: "My account", url: "/account/dashboard" },
                    { label: "Personal information", url: "/account/profile/edit" },
                ]}
            >
                <div className="col-12 col-md-9">
                    <div className="mb-4">
                        <h1>Your profile</h1>
                        Edit your personal information
                    </div>

                    {loading ? (
                        <Skeleton count={12} height={36} className="mb-2" />
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">First name *</label>
                                    <input
                                        className="form-control"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Last name *</label>
                                    <input
                                        className="form-control"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-12 mb-3">
                                    <label className="form-label">Email *</label>
                                    <input
                                        className="form-control"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Birthday *</label>
                                    <input
                                        className="form-control"
                                        name="birthday"
                                        type="date"
                                        value={formData.birthday}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Gender *</label>
                                    <select
                                        className="form-select"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="m">Male</option>
                                        <option value="f">Female</option>
                                        <option value="u">Unknown</option>
                                    </select>
                                </div>
                                <div className="col-12 mb-3">
                                    <label className="form-label">Phone number</label>
                                    <input
                                        className="form-control"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-12 mb-4 form-check">
                                    <input
                                        type="checkbox"
                                        id="newsletter"
                                        className="form-check-input"
                                        name="subscribedToNewsletter"
                                        checked={formData.subscribedToNewsletter}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="newsletter" className="form-check-label">
                                        Subscribe to the newsletter
                                    </label>
                                </div>
                            </div>

                            <button className="btn btn-primary">Save changes</button>
                        </form>
                    )}
                </div>
            </AccountLayout>
        </Default>
    );
};

export default ProfilePage;
