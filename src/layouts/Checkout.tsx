import React from 'react';
import Header from './../components/layout/checkout/Header';
import Sidebar from './../components/layout/checkout/Sidebar';

interface CheckoutLayoutProps {
    children: React.ReactNode;
    sidebarOn?: boolean;
}

const CheckoutLayout: React.FC<CheckoutLayoutProps> = ({ children, sidebarOn = true }) => {
    return (
        <div className="flex flex-col min-h-screen overflow-hidden">
            <Header />
            <div className="flex-1 flex items-stretch">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap h-full">
                        {children}
                        {sidebarOn && <Sidebar />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutLayout;
