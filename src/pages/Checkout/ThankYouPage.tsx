import React from 'react';
import Layout from '../../layouts/Default';
import { useCustomer } from '../../context/CustomerContext';
import { useLocation, Link } from 'react-router-dom';

const ThankYouPage: React.FC = () => {
    const { customer } = useCustomer();
    const location = useLocation();
    const tokenValue = location.state?.tokenValue || localStorage.getItem('orderToken'); // <--- poprawka

    return (
        <Layout>
            <div className="container text-center my-auto">
                <div className="row flex-column my-4">
                    <h1 className="h2">Thank you!</h1>
                    You have successfully placed an order.

                    <div className="d-flex flex-column flex-lg-row justify-content-center gap-2 mt-4">
                        {customer && tokenValue ? (
                            <Link className="btn btn-primary" to={`/account/orders/${tokenValue}`}>
                                View order
                            </Link>
                        ) : (
                            <>
                                {tokenValue && (
                                    <Link className="btn btn-primary" to={`/order/${tokenValue}/pay`}>
                                        Change payment method
                                    </Link>
                                )}
                                <Link className="btn btn-secondary" to="/register">
                                    Create an account
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ThankYouPage;
