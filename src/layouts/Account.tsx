import {
  IconBook,
  IconHome,
  IconLock,
  IconShoppingCart,
  IconUser,
} from "@tabler/icons-react";
import React from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";

interface AccountLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: { label: string; url: string }[];
}

const AccountLayout: React.FC<AccountLayoutProps> = ({ children, breadcrumbs }) => {
    const defaultBreadcrumbs = [
        { label: "Home", url: "/" },
        { label: "My account", url: "/account/dashboard" },
    ];

    return (
        <div className="container mx-auto px-4 mb-auto">
            <div className="flex flex-wrap my-4">
                <div className="w-full mb-4">
                    <Breadcrumbs paths={breadcrumbs ?? defaultBreadcrumbs} />
                </div>

        <div className="w-full md:w-1/4 mb-4 md:mb-0 px-4">
          <div className="mb-3">
            <div className="text-2xl font-semibold mb-4">Your account</div>
            <div className="inline-flex flex-col">
              <Link
                className="flex items-center gap-2 py-1 link-reset"
                to="/account/dashboard"
              >
                <IconHome stroke={1.25} size={28} />
                Dashboard
              </Link>

              <a
                className="flex items-center gap-2 py-1 link-reset"
                href="/account/profile/edit"
              >
                <IconUser stroke={1.25} size={28} />
                Personal information
              </a>

              <a
                className="flex items-center gap-2 py-1 link-reset"
                href="/account/change-password"
              >
                <IconLock stroke={1.25} size={28} />
                Change password
              </a>

              <a
                className="flex items-center gap-2 py-1 link-reset"
                href="/account/address-book/"
              >
                <IconBook stroke={1.25} size={28} />
                Address book
              </a>

              <a
                className="flex items-center gap-2 py-1 link-reset"
                href="/account/order-history"
              >
                <IconShoppingCart stroke={1.25} size={28} />
                Order history
              </a>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AccountLayout;
