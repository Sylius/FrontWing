import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "@remix-run/react";
import Default from "~/layouts/Default";
import { useFlashMessages } from "~/context/FlashMessagesContext";
import { useCustomer } from "~/context/CustomerContext";

export default function VerificationPage() {
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
            setMessage("No verification token found in the URL. Please ensure you clicked the correct link.");
            return;
        }
        if (attempted.current) return;
        attempted.current = true;

        async function verify() {
            setStatus("pending");
            setMessage("Verifying your email address...");

            const API_URL = window.ENV?.API_URL;
            if (!API_URL) {
                setStatus("error");
                setMessage("Configuration error: API URL not set.");
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
                    setMessage(data.message || "Your email has been successfully verified!");
                    addMessage("success", "Email verified. You can now log in or continue using your account.");
                    await refetchCustomer();
                } else {
                    const msg = data.message || data.detail || "Email verification failed. The link might be expired or invalid.";
                    setStatus("error");
                    setMessage(msg);
                    addMessage("error", msg);
                }
            } catch (err: unknown) {
                console.error("Verification error:", err);
                setStatus("error");
                setMessage("An unexpected error occurred during verification. Please try again.");
                addMessage("error", "An unexpected error occurred during verification. Please try again.");
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
                                <h1 className="h2 mb-3">Verifying your email...</h1>
                                <p className="lead mb-4">Please wait while we confirm your email address.</p>
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </>
                        )}
                        {status === "success" && (
                            <>
                                <h1 className="h2 mb-3">Email Verified!</h1>
                                <p className="lead mb-4">{message}</p>
                                <p className="mb-5">Your account is now active.</p>
                                <Link to="/login" className="btn btn-primary">
                                    Go to Login
                                </Link>
                            </>
                        )}
                        {status === "error" && (
                            <>
                                <h1 className="h2 mb-3">Verification Failed</h1>
                                <p className="lead mb-4">{message}</p>
                                <p className="mb-5">
                                    Please ensure you clicked the correct link. The link may have expired or been used.
                                    If you have an account, you can try
                                    <Link to="/login" className="link-reset ms-1">
                                        logging in
                                    </Link>
                                    and requesting a new verification email from your dashboard.
                                </p>
                                <Link to="/login" className="btn btn-primary">
                                    Go to Login
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Default>
    );
}
