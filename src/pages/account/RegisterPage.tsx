import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Default from "../../layouts/Default.tsx";
import { IconUserPlus } from "@tabler/icons-react";
import { useFlashMessages } from "../../context/FlashMessagesContext.tsx";

interface FieldErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    phoneNumber?: string;
    [key: string]: string | undefined;
}

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const RegisterPage: React.FC = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { addMessage } = useFlashMessages();

    const validate = (): boolean => {
        const errs: FieldErrors = {};
        if (!firstName.trim()) errs.firstName = "First name required";
        if (!lastName.trim()) errs.lastName = "Last name required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email";
        if (password.length < 6) errs.password = "Password ≥6 chars";
        if (password !== confirmPassword) errs.confirmPassword = "Must match password";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        if (!validate()) {
            addMessage("error", "Please correct the errors in the form.");
            return;
        }
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/v2/shop/customers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    phoneNumber: phoneNumber.trim() === '' ? null : phoneNumber,
                    subscribedToNewsletter: subscribeNewsletter,
                    plainPassword: password,
                    password: password
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                if (errorData.violations) {
                    const apiFieldErrors: FieldErrors = {};
                    errorData.violations.forEach((violation: { propertyPath: string; message: string }) => {
                        apiFieldErrors[violation.propertyPath] = violation.message;
                    });
                    setErrors(prevErrors => ({ ...prevErrors, ...apiFieldErrors }));
                    addMessage("error", "Registration failed. Please correct the errors in the form.");
                } else {
                    addMessage("error", errorData["hydra:description"] || errorData.message || "Registration failed due to an unknown error.");
                }
                return;
            }

            addMessage("success", "Thank you for registering! Check your email to verify your account.");
            navigate("/register/thank-you", { replace: true });

        } catch (err: unknown) {
            if (err instanceof Error) {
                addMessage("error", err.message);
            } else {
                addMessage("error", "An unexpected error occurred during registration.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Default>
            <div className="container my-auto">
                <div className="row justify-content-center my-5">
                    <div className="col-12 col-md-8 col-lg-6">
                        <h1 className="h2 mb-1">Create a new customer account</h1>
                        <p className="mb-4">
                            Have an account already?{" "}
                            <Link to="/login" className="link-reset">
                                Sign in here.
                            </Link>
                        </p>

                        <form onSubmit={handleRegister} noValidate>
                            <h2 className="h5 mb-3">Personal information</h2>

                            <div className="mb-3">
                                <label htmlFor="firstName" className="form-label required">First name <span
                                    className="text-danger">*</span></label>
                                <input
                                    id="firstName"
                                    type="text"
                                    className={"form-control" + (errors.firstName ? " is-invalid" : "")}
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                    autoComplete="given-name"
                                />
                                {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="lastName" className="form-label required">Last name <span
                                    className="text-danger">*</span></label>
                                <input
                                    id="lastName"
                                    type="text"
                                    className={"form-control" + (errors.lastName ? " is-invalid" : "")}
                                    value={lastName}
                                    onChange={e => setLastName(e.target.value)}
                                    autoComplete="family-name"
                                />
                                {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="email" className="form-label required">Email <span
                                    className="text-danger">*</span></label>
                                <input
                                    id="email"
                                    type="email"
                                    className={"form-control" + (errors.email ? " is-invalid" : "")}
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    autoComplete="email"
                                />
                                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="phoneNumber" className="form-label">Phone number</label>
                                <input
                                    id="phoneNumber"
                                    type="tel"
                                    className={"form-control" + (errors.phoneNumber ? " is-invalid" : "")}
                                    value={phoneNumber}
                                    onChange={e => setPhoneNumber(e.target.value)}
                                    autoComplete="tel"
                                />
                                {errors.phoneNumber && <div className="invalid-feedback">{errors.phoneNumber}</div>}
                            </div>

                            <div className="form-check mb-5">
                                <input
                                    id="newsletter"
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={subscribeNewsletter}
                                    onChange={e => setSubscribeNewsletter(e.target.checked)}
                                />
                                <label htmlFor="newsletter" className="form-check-label">
                                    Subscribe to the newsletter
                                </label>
                            </div>

                            <h2 className="h5 mb-3">Account credentials</h2>

                            <div className="mb-3">
                                <label htmlFor="password" className="form-label required">Password <span
                                    className="text-danger">*</span></label>
                                <input
                                    id="password"
                                    type="password"
                                    className={"form-control" + (errors.password ? " is-invalid" : "")}
                                    minLength={6}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                />
                                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="confirmPassword" className="form-label required">Verification <span
                                    className="text-danger">*</span></label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    className={"form-control" + (errors.confirmPassword ? " is-invalid" : "")}
                                    minLength={6}
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                />
                                {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                            </div>

                            <div className="d-grid mb-5">
                                <button type="submit" className="btn btn-primary btn-icon" disabled={loading}>
                                    <IconUserPlus size={20} /> Create an account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Default>
    );
};

export default RegisterPage;
