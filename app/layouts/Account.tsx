import React, { useEffect } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import { Link, useNavigate } from "react-router-dom";
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
    const { customer, loading } = useCustomer();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !customer) {
            navigate("/", { replace: true });
        }
    }, [customer, loading, navigate]);

    const defaultBreadcrumbs = [
        { label: "Home", url: "/" },
        { label: "My account", url: "/account/dashboard" },
    ];

    return (
        <div className="container mb-auto">
            <div className="row my-4">
                <div className="col-12">
                    <Breadcrumbs paths={breadcrumbs ?? defaultBreadcrumbs} />
                </div>

                <div className="col-12 col-md-3 mb-4 mb-md-0">
                    <div className="mb-3">
                        <div className="h3 mb-4">Your account</div>
                        <div className="d-inline-flex flex-column">
                            <Link
                                className="d-flex align-items-center gap-2 py-1 link-reset"
                                to="/account/dashboard"
                            >
                                <IconHome stroke={1.25} size={28} />
                                Dashboard
                            </Link>

                            <Link
                                className="d-flex align-items-center gap-2 py-1 link-reset"
                                to="/account/profile/edit"
                            >
                                <IconUser stroke={1.25} size={28} />
                                Personal information
                            </Link>

                            <Link
                                className="d-flex align-items-center gap-2 py-1 link-reset"
                                to="/account/change-password"
                            >
                                <IconLock stroke={1.25} size={28} />
                                Change password
                            </Link>

                            <Link
                                className="d-flex align-items-center gap-2 py-1 link-reset"
                                to="/account/address-book/"
                            >
                                <IconBook stroke={1.25} size={28} />
                                Address book
                            </Link>

                            <Link
                                className="d-flex align-items-center gap-2 py-1 link-reset"
                                to="/account/order-history"
                            >
                                <IconShoppingCart stroke={1.25} size={28} />
                                Order history
                            </Link>
                        </div>
                    </div>
                </div>

                {children}
            </div>
        </div>
    );
};

export default AccountLayout;
