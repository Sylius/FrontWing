import React from 'react';
import Layout from '../../layouts/Default';
import { useCustomer } from '../../context/CustomerContext';
import { useLocation } from 'react-router-dom';

const ThankYouPage: React.FC = () => {
    const { customer } = useCustomer();
    const location = useLocation();
    const tokenValue = location.state?.tokenValue;

    return (
        <Layout>
            <div className="container text-center my-auto">
                <div className="flex flex-col my-4">
                    <h1 className="text-2xl font-bold">Thank you!</h1>
                    You have successfully placed an order.

                    <div className="flex flex-col lg:flex-row justify-center gap-2 mt-4">
                        {customer && tokenValue ? (
                            <a className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded hover:bg-primary/90" href={`/account/orders/${tokenValue}`}>
                                View order
                            </a>
                        ) : (
                            <>
                                <a className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded hover:bg-primary/90" href="/orderpay">
                                    Change payment method
                                </a>
                                <a className="inline-flex items-center justify-center px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/80" href="/register">
                                    Create an account
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ThankYouPage;
