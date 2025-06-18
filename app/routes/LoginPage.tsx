import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "@remix-run/react";
import Default from "~/layouts/Default";
import { useCustomer } from "~/context/CustomerContext";
import { useFlashMessages } from "~/context/FlashMessagesContext";
import AuthLeftPanel from "~/components/account/AuthLeftPanel";

const getApiUrl = (): string => {
    if (typeof window !== "undefined" && window.ENV?.API_URL) {
        return window.ENV.API_URL;
    }
    return "";
};

export default function LoginPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addMessage } = useFlashMessages();
    const { refetchCustomer } = useCustomer();

    const resetRequestedShown = useRef(false);
    const resetSuccessShown = useRef(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!resetRequestedShown.current && searchParams.get("resetRequested")) {
            resetRequestedShown.current = true;
            addMessage("success", "If the email you specified exists, instructions to reset your password have been sent.");
            navigate("/login", { replace: true });
        }
    }, [searchParams, addMessage, navigate]);

    useEffect(() => {
        if (!resetSuccessShown.current && searchParams.get("resetSuccessful")) {
            resetSuccessShown.current = true;
            addMessage("success", "Your password has been reset successfully! You can now log in.");
            navigate("/login", { replace: true });
        }
    }, [searchParams, addMessage, navigate]);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const apiUrl = getApiUrl();
            if (!apiUrl) throw new Error("API URL is not configured");

            const response = await fetch(`${apiUrl}/api/v2/shop/customers/token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data: { token: string; customer: string; message?: string } = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Invalid credentials");
            }

            localStorage.setItem("jwtToken", data.token);
            localStorage.setItem("userUrl", data.customer);
            console.log("✅ Login success. JWT token and userUrl stored.");

            await refetchCustomer();

            // ✅ NIE tworzymy nowego ordera – zachowujemy stare ciasteczko z orderToken
            navigate("/account/dashboard", { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Default>
            <div className="container my-auto">
                <div className="row my-4">
                    <div className="col-12 col-sm-10 offset-sm-1 col-md-8 offset-md-2 col-lg-6 offset-lg-0 col-xl-4 offset-xl-1 order-lg-1">
                        <div className="d-flex justify-content-center align-items-center h-100 px-3">
                            <div className="w-100 py-lg-5 mb-5 my-lg-5">
                                <h1 className="h2 mb-5">Login</h1>
                                <form onSubmit={handleLogin} noValidate>
                                    {error && (
                                        <div className="alert alert-danger">
                                            <div className="fw-bold">Error</div>
                                            {error}
                                        </div>
                                    )}

                                    <div className="mb-5">
                                        <div className="field mb-3 required">
                                            <label htmlFor="_username" className="form-label required">
                                                Username <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="_username"
                                                name="_username"
                                                required
                                                className="form-control"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>

                                        <div className="field mb-3 required">
                                            <label htmlFor="_password" className="form-label required">
                                                Password <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                id="_password"
                                                name="_password"
                                                required
                                                className="form-control"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>

                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                id="_remember_me"
                                                name="_remember_me"
                                                className="form-check-input"
                                                value="1"
                                            />
                                            <label className="form-check-label" htmlFor="_remember_me">
                                                Remember me
                                            </label>
                                        </div>
                                    </div>

                                    <div className="d-grid mb-2">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            id="login-button"
                                            disabled={loading}
                                        >
                                            {loading ? "Logging in..." : "Login"}
                                        </button>
                                    </div>
                                </form>

                                <div className="d-grid">
                                    <Link to="/forgotten-password" className="btn btn-link">
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <AuthLeftPanel />
                </div>
            </div>
        </Default>
    );
}
