import React, { useEffect } from 'react';
import { useLocation } from '@remix-run/react';
import Header from './../components/layout/checkout/Header';
import Sidebar from './../components/layout/checkout/Sidebar';
import { useOrder } from '~/context/OrderContext';

interface CheckoutLayoutProps {
    children: React.ReactNode;
    sidebarOn?: boolean;
}

const CheckoutLayout: React.FC<CheckoutLayoutProps> = ({ children, sidebarOn = true }) => {
    const location = useLocation();
    const { fetchOrder } = useOrder();

    useEffect(() => {
        fetchOrder();
    }, [location.pathname]);

    return (
        <div className="d-flex flex-column min-vh-100 overflow-hidden">
            <Header />
            <div className="flex-grow-1 d-flex align-items-stretch">
                <div className="container">
                    <div className="row h-100">
                        {children}
                        {sidebarOn && <Sidebar />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutLayout;
