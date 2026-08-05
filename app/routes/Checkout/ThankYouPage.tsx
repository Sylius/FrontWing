import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Layout from "~/layouts/Default";
import { useCustomer } from "~/context/CustomerContext";
import { useSearchParams, useLocation } from "react-router";
import { LocalizedLink } from "~/components/LocalizedLink";
import { useOrder } from "~/context/OrderContext";

export default function ThankYouPage() {
    const { t } = useTranslation("checkout");
    const { customer } = useCustomer();
    const { resetCart } = useOrder();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    const tokenFromQuery = searchParams.get("token") || searchParams.get("completed");
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

    useEffect(() => {
        resetCart();
    }, []);

    return (
        <Layout>
            <div className="container text-center my-auto">
                <div className="row flex-column my-4">
                    <h1 className="h2">{t("thankYou.title")}</h1>
                    <p>{t("thankYou.message")}</p>

                    <div className="d-flex flex-column flex-lg-row justify-content-center gap-2 mt-4">
                        {customer && token ? (
                            <LocalizedLink to={`/account/orders/${token}`} className="btn btn-primary">
                                {t("thankYou.viewOrder")}
                            </LocalizedLink>
                        ) : (
                            <>
                                {token && (
                                    <LocalizedLink
                                        to={`/account/orders/${token}/pay`}
                                        className="btn btn-primary"
                                    >
                                        {t("thankYou.changePayment")}
                                    </LocalizedLink>
                                )}
                                <LocalizedLink to="/register" className="btn btn-secondary">
                                    {t("thankYou.createAccount")}
                                </LocalizedLink>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
