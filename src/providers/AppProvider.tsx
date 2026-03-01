import React from "react";
import { Toaster } from "sonner";
import { CustomerProvider } from "../context/CustomerContext";
import { OrderProvider } from "../context/OrderContext";
import { FlashMessagesProvider } from "../context/FlashMessagesContext";

interface AppProvidersProps {
  children: React.ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <CustomerProvider>
      <OrderProvider>
        <FlashMessagesProvider>
          {children}
          <Toaster richColors position="top-center" />
        </FlashMessagesProvider>
      </OrderProvider>
    </CustomerProvider>
  );
};

export default AppProviders;
