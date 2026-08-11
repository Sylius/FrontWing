export const handle = { i18n: ["common","cart","account"] };

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LocalizedLink } from "~/components/LocalizedLink";
import { useLocalizedNavigate } from "~/hooks/useLocalizedNavigate";
import Default from "~/layouts/Default";
import { IconUserPlus } from "@tabler/icons-react";
import { useFlashMessages } from "~/context/FlashMessagesContext";

interface FieldErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    phoneNumber?: string;
    [key: string]: string | undefined;
}

export default function RegisterPage() {
    const { t } = useTranslation("account");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [loading, setLoading] = useState(false);

    const navigate = useLocalizedNavigate();
    const { addMessage } = useFlashMessages();

    function validate(): boolean {
        const errs: FieldErrors = {};
        if (!firstName.trim()) errs.firstName = t("auth.register.errors.firstName");
        if (!lastName.trim()) errs.lastName = t("auth.register.errors.lastName");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = t("auth.register.errors.email");
        if (password.length < 6) errs.password = t("auth.register.errors.password");
        if (password !== confirmPassword) errs.confirmPassword = t("auth.register.errors.confirmPassword");
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setErrors({});
        if (!validate()) {
            addMessage("error", t("auth.register.correctErrors"));
            return;
        }
        setLoading(true);

        try {
            const API_URL = window.ENV?.API_URL;
            if (!API_URL) throw new Error(t("auth.register.apiNotConfigured"));

            const payload = {
                firstName,
                lastName,
                email,
                phoneNumber: phoneNumber.trim() || null,
                password,
                subscribedToNewsletter: subscribeNewsletter,
            };

            const response = await fetch(`${API_URL}/api/v2/shop/customers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(payload),
            });

            const text = await response.text();
            let data: any = {};
            try {
                data = text ? JSON.parse(text) : {};
            } catch {}

            if (!response.ok) {
                if (data.violations) {
                    const apiErrors: FieldErrors = {};
                    data.violations.forEach((v: any) => {
                        apiErrors[v.propertyPath] = v.message;
                    });
                    setErrors(apiErrors);
                    addMessage("error", t("auth.register.registrationFailed"));
                } else {
                    addMessage("error", data["hydra:description"] || data.message || t("auth.register.registrationError"));
                }
                return;
            }

            addMessage("success", t("auth.register.success"));
            navigate("/register/thank-you", { replace: true });
        } catch (err: unknown) {
            addMessage("error", err instanceof Error ? err.message : t("auth.register.unexpectedError"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Default>
            <div className="container my-auto">
                <div className="row justify-content-center my-5">
                    <div className="col-12 col-md-8 col-lg-6">
                        <h1 className="h2 mb-1">{t("auth.register.title")}</h1>
                        <p className="mb-4">
                            {t("auth.register.haveAccount")}{" "}
                            <LocalizedLink to="/login" className="link-reset">
                                {t("auth.register.signIn")}
                            </LocalizedLink>
                        </p>

                        <form onSubmit={handleRegister} noValidate>
                            <h2 className="h5 mb-3">{t("auth.register.personalInfo")}</h2>

                            <div className="mb-3">
                                <label htmlFor="firstName" className="form-label required">
                                    {t("auth.register.firstName")} <span className="text-danger">*</span>
                                </label>
                                <input
                                    id="firstName"
                                    type="text"
                                    className={`form-control${errors.firstName ? " is-invalid" : ""}`}
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    autoComplete="given-name"
                                />
                                {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="lastName" className="form-label required">
                                    {t("auth.register.lastName")} <span className="text-danger">*</span>
                                </label>
                                <input
                                    id="lastName"
                                    type="text"
                                    className={`form-control${errors.lastName ? " is-invalid" : ""}`}
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    autoComplete="family-name"
                                />
                                {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="email" className="form-label required">
                                    {t("auth.register.email")} <span className="text-danger">*</span>
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    className={`form-control${errors.email ? " is-invalid" : ""}`}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                />
                                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="phoneNumber" className="form-label">
                                    {t("auth.register.phone")}
                                </label>
                                <input
                                    id="phoneNumber"
                                    type="tel"
                                    className={`form-control${errors.phoneNumber ? " is-invalid" : ""}`}
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
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
                                    onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                                />
                                <label htmlFor="newsletter" className="form-check-label">
                                    {t("auth.register.newsletter")}
                                </label>
                            </div>

                            <h2 className="h5 mb-3">{t("auth.register.credentials")}</h2>

                            <div className="mb-3">
                                <label htmlFor="password" className="form-label required">
                                    {t("auth.register.password")} <span className="text-danger">*</span>
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    className={`form-control${errors.password ? " is-invalid" : ""}`}
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                />
                                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="confirmPassword" className="form-label required">
                                    {t("auth.register.verifyPassword")} <span className="text-danger">*</span>
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    className={`form-control${errors.confirmPassword ? " is-invalid" : ""}`}
                                    minLength={6}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                />
                                {errors.confirmPassword && (
                                    <div className="invalid-feedback">{errors.confirmPassword}</div>
                                )}
                            </div>

                            <div className="d-grid mb-5">
                                <button type="submit" className="btn btn-primary btn-icon" disabled={loading}>
                                    <IconUserPlus size={20} /> {t("auth.register.submit")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Default>
    );
}
