import React from "react";
import Layout from "../../layouts/Default";
import { useCustomer } from "../../context/CustomerContext";
import { useLocation } from "react-router-dom";

const ThankYouPage: React.FC = () => {
  const { customer } = useCustomer();
  const location = useLocation();
  const tokenValue = location.state?.tokenValue;

  return (
    <Layout>
      <div className="container my-auto text-center">
        <div className="my-4 flex flex-col">
          <h1 className="text-2xl font-bold">Thank you!</h1>
          You have successfully placed an order.
          <div className="mt-4 flex flex-col justify-center gap-2 lg:flex-row">
            {customer && tokenValue ? (
              <a
                className="bg-primary hover:bg-primary/90 inline-flex items-center justify-center rounded px-4 py-2 text-white"
                href={`/account/orders/${tokenValue}`}
              >
                View order
              </a>
            ) : (
              <>
                <a
                  className="bg-primary hover:bg-primary/90 inline-flex items-center justify-center rounded px-4 py-2 text-white"
                  href="/orderpay"
                >
                  Change payment method
                </a>
                <a
                  className="bg-muted text-foreground hover:bg-muted/80 inline-flex items-center justify-center rounded px-4 py-2"
                  href="/register"
                >
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
