import { useRoutes } from "react-router-dom";
import { accountRoutes } from "./accountRoutes";
import { checkoutRoutes, thankYouRoute } from "./checkoutRoutes";
import { coreRoutes } from "./coreRoutes";
import { productRoutes } from "./productRoutes";

const AppRoutes = () => {
  return useRoutes([...coreRoutes, ...productRoutes, checkoutRoutes, thankYouRoute, accountRoutes]);
};

export default AppRoutes;
