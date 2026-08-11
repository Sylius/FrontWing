import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "../components/Breadcrumbs";
import { LocalizedLink } from "~/components/LocalizedLink";
import { useLocalizedNavigate } from "~/hooks/useLocalizedNavigate";
import {
    IconBook,
    IconHome,
    IconLock,
    IconShoppingCart,
    IconUser,
} from "@tabler/icons-react";
import { useCustomer } from "~/context/CustomerContext";

interface AccountLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: { label: string; url: string }[];
}

const AccountLayout: React.FC<AccountLayoutProps> = ({ children, breadcrumbs }) => {
    const { t } = useTranslation(["account", "common"]);
    const { customer, loading } = useCustomer();
    const navigate = useLocalizedNavigate();

    useEffect(() => {
        if (!loading && !customer) {
            navigate("/", { replace: true });
        }
    }, [customer, loading, navigate]);

    const defaultBreadcrumbs = [
        { label: t("common:nav.home"), url: "/" },
        { label: t("common:nav.account"), url: "/account/dashboard" },
    ];

    return (
        <div className="container mb-auto">
            <div className="row my-4">
                <div className="col-12">
                    <Breadcrumbs paths={breadcrumbs ?? defaultBreadcrumbs} />
                </div>

                <div className="col-12 col-md-3 mb-4 mb-md-0">
                    <div className="mb-3">
                        <div className="h3 mb-4">{t("panel.title")}</div>
                        <div className="d-inline-flex flex-column">
                            <LocalizedLink
                                className="d-flex align-items-center gap-2 py-1 link-reset"
                                to="/account/dashboard"
                            >
                                <IconHome stroke={1.25} size={28} />
                                {t("panel.dashboard")}
                            </LocalizedLink>

                            <LocalizedLink
                                className="d-flex align-items-center gap-2 py-1 link-reset"
                                to="/account/profile/edit"
                            >
                                <IconUser stroke={1.25} size={28} />
                                {t("panel.personalInfo")}
                            </LocalizedLink>

                            <LocalizedLink
                                className="d-flex align-items-center gap-2 py-1 link-reset"
                                to="/account/change-password"
                            >
                                <IconLock stroke={1.25} size={28} />
                                {t("panel.changePassword")}
                            </LocalizedLink>

                            <LocalizedLink
                                className="d-flex align-items-center gap-2 py-1 link-reset"
                                to="/account/address-book/"
                            >
                                <IconBook stroke={1.25} size={28} />
                                {t("panel.addressBook")}
                            </LocalizedLink>

                            <LocalizedLink
                                className="d-flex align-items-center gap-2 py-1 link-reset"
                                to="/account/order-history"
                            >
                                <IconShoppingCart stroke={1.25} size={28} />
                                {t("panel.orderHistory")}
                            </LocalizedLink>
                        </div>
                    </div>
                </div>

                {children}
            </div>
        </div>
    );
};

export default AccountLayout;
