import { RouteObject } from "react-router-dom";
import CartPage from "../pages/CartPage";
import Homepage from "../pages/Homepage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";

export const coreRoutes: RouteObject[] = [
  { path: "/", element: <Homepage /> },
  { path: "cart", element: <CartPage /> },
  { path: "login", element: <LoginPage /> },
  { path: "*", element: <NotFoundPage /> },
];
