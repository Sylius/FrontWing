import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useCustomer } from "../../context/CustomerContext";

const RequireAuth: React.FC = () => {
  const { customer, loading } = useCustomer();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !customer) {
      navigate("/login", { replace: true, state: { from: location } });
    }
  }, [loading, customer, navigate, location]);

  return <Outlet />;
};

export default RequireAuth;
