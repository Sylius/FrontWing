export const handle = { i18n: ["common","cart","account"] };

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import { LocalizedLink } from "~/components/LocalizedLink";
import Default from "~/layouts/Default";
import { useFlashMessages } from "~/context/FlashMessagesContext";
import { useCustomer } from "~/context/CustomerContext";

export default function VerificationPage() {
    const { t } = useTranslation("account");
    const [searchParams] = useSearchParams();
    const { addMessage } = useFlashMessages();
    const { refetchCustomer } = useCustomer();

    const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
    const [message, setMessage] = useState<string>("");
    const attempted = useRef(false);

    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) {
            setStatus("error");
            setMessage(t("auth.verification.noToken"));
            return;
        }
        if (attempted.current) return;
        attempted.current = true;

        async function verify() {
            setStatus("pending");
            setMessage(t("auth.verification.verifying"));

            const API_URL = window.ENV?.API_URL;
            if (!API_URL) {
                setStatus("error");
                setMessage(t("auth.verification.configError"));
                return;
            }

            try {
                const headers: HeadersInit = {
                    "Content-Type": "application/merge-patch+json",
                };

                const response = await fetch(
                    `${API_URL}/api/v2/shop/customers/verify/${token}`,
                    {
                        method: "PATCH",
                        headers,
                        body: JSON.stringify({}),
                    }
                );

                const text = await response.text();
                let data: any = {};
                try {
                    data = text ? JSON.parse(text) : {};
                } catch {}

                if (response.ok) {
                    setStatus("success");
                    setMessage(data.message || t("auth.verification.successMessage"));
                    addMessage("success", t("auth.verification.flashSuccess"));
                    await refetchCustomer();
                } else {
                    const msg = data.message || data.detail || t("auth.verification.failedFallback");
                    setStatus("error");
                    setMessage(msg);
                    addMessage("error", msg);
                }
            } catch (err: unknown) {
                console.error("Verification error:", err);
                setStatus("error");
                setMessage(t("auth.verification.unexpectedError"));
                addMessage("error", t("auth.verification.unexpectedError"));
            }
        }

        verify();
    }, [searchParams, addMessage, refetchCustomer]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.scrollTo(0, 0);
        }
    }, []);

    return (
        <Default>
            <div className="container my-auto">
                <div className="row justify-content-center my-5">
                    <div className="col-12 col-md-8 col-lg-6 text-center">
                        {status === "pending" && (
                            <>
                                <h1 className="h2 mb-3">{t("auth.verification.pendingTitle")}</h1>
                                <p className="lead mb-4">{t("auth.verification.pendingText")}</p>
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">{t("auth.verification.loading")}</span>
                                </div>
                            </>
                        )}
                        {status === "success" && (
                            <>
                                <h1 className="h2 mb-3">{t("auth.verification.successTitle")}</h1>
                                <p className="lead mb-4">{message}</p>
                                <p className="mb-5">{t("auth.verification.accountActive")}</p>
                                <LocalizedLink to="/login" className="btn btn-primary">
                                    {t("auth.verification.goToLogin")}
                                </LocalizedLink>
                            </>
                        )}
                        {status === "error" && (
                            <>
                                <h1 className="h2 mb-3">{t("auth.verification.failedTitle")}</h1>
                                <p className="lead mb-4">{message}</p>
                                <p className="mb-5">
                                    {t("auth.verification.errorHelpBefore")}
                                    <LocalizedLink to="/login" className="link-reset ms-1">
                                        {t("auth.verification.errorHelpLink")}
                                    </LocalizedLink>
                                    {t("auth.verification.errorHelpAfter")}
                                </p>
                                <LocalizedLink to="/login" className="btn btn-primary">
                                    {t("auth.verification.goToLogin")}
                                </LocalizedLink>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Default>
    );
}
