import { IconBook, IconHome, IconLock, IconShoppingCart, IconUser } from "@tabler/icons-react";
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
    <div className="container mx-auto mb-auto px-4">
      <div className="my-4 flex flex-wrap">
        <div className="mb-4 w-full">
          <Breadcrumbs paths={breadcrumbs ?? defaultBreadcrumbs} />
        </div>

        <div className="mb-4 w-full px-4 md:mb-0 md:w-1/4">
          <div className="mb-3">
            <div className="mb-4 text-2xl font-semibold">Your account</div>
            <div className="inline-flex flex-col">
              <Link className="link-reset flex items-center gap-2 py-1" to="/account/dashboard">
                <IconHome stroke={1.25} size={28} />
                Dashboard
              </Link>

              <Link className="link-reset flex items-center gap-2 py-1" to="/account/profile/edit">
                <IconUser stroke={1.25} size={28} />
                Personal information
              </Link>

              <Link
                className="link-reset flex items-center gap-2 py-1"
                to="/account/change-password"
              >
                <IconLock stroke={1.25} size={28} />
                Change password
              </Link>

              <Link className="link-reset flex items-center gap-2 py-1" to="/account/address-book">
                <IconBook stroke={1.25} size={28} />
                Address book
              </Link>

              <Link className="link-reset flex items-center gap-2 py-1" to="/account/order-history">
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
