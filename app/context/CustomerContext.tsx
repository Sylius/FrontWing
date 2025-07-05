import React, { createContext, useContext, useEffect, useState } from "react";
import { Customer } from "~/types/Customer";

interface CustomerContextType {
  customer: Customer | null;
  loading: boolean;
  error: string | null;
  refetchCustomer: () => void;
  clearCustomer: () => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = async () => {
    const token = localStorage.getItem("jwtToken");
    const userUrl = localStorage.getItem("userUrl");

    setLoading(true);
    setError(null);

    if (!token || !userUrl) {
      setCustomer(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${window.ENV?.API_URL}${userUrl}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Unauthorized");
      }

      const data = await response.json();
      setCustomer(data);
    } catch (err: any) {
      setCustomer(null);
      setError(err.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, []);

  const clearCustomer = () => {
    setCustomer(null);
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userUrl");
  };

  return (
      <CustomerContext.Provider
          value={{
            customer,
            loading,
            error,
            refetchCustomer: fetchCustomer,
            clearCustomer,
          }}
      >
        {children}
      </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error("useCustomer must be used within a CustomerProvider");
  }
  return context;
};
