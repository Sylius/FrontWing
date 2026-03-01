import React from "react";
import Header from "./../components/layout/checkout/Header";
import Sidebar from "./../components/layout/checkout/Sidebar";

interface CheckoutLayoutProps {
  children: React.ReactNode;
  sidebarOn?: boolean;
}

const CheckoutLayout: React.FC<CheckoutLayoutProps> = ({ children, sidebarOn = true }) => {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 items-stretch">
        <div className="container mx-auto px-4">
          <div className="flex h-full flex-wrap">
            {children}
            {sidebarOn && <Sidebar />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutLayout;
