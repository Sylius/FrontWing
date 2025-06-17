import React from "react";
import Layout from "~/layouts/Default";
import { useCustomer } from "~/context/CustomerContext";
import { useSearchParams, useLocation, Link } from "@remix-run/react";

export default function ThankYouPage() {
    const { customer } = useCustomer();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    const tokenFromQuery = searchParams.get("token");
    const tokenFromState = (location.state as any)?.tokenValue;
    const token =
        tokenFromState ||
        tokenFromQuery ||
        (typeof document !== "undefined"
            ? document.cookie
                .split("; ")
                .find((row) => row.startsWith("orderToken="))
                ?.split("=")[1]
            : null);

    return (
        <Layout>
            <div className="container text-center my-auto">
                <div className="row flex-column my-4">
                    <h1 className="h2">Thank you!</h1>
                    <p>You have successfully placed an order.</p>

                    <div className="d-flex flex-column flex-lg-row justify-content-center gap-2 mt-4">
                        {customer && token ? (
                            <Link to={`/account/orders/${token}`} className="btn btn-primary">
                                View order
                            </Link>
                        ) : (
                            <>
                                {token && (
                                    <Link
                                        to={`/account/orders/${token}/pay`}
                                        className="btn btn-primary"
                                    >
                                        Change payment method
                                    </Link>
                                )}
                                <Link to="/register" className="btn btn-secondary">
                                    Create an account
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
