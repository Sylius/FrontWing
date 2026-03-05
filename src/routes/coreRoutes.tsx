import { RouteObject } from "react-router-dom";
import Homepage from "../pages/Homepage";
import CartPage from "../pages/CartPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import NotFoundPage from "../pages/NotFoundPage";

export const coreRoutes: RouteObject[] = [
  { path: "/", element: <Homepage /> },
  { path: "cart", element: <CartPage /> },
  { path: "login", element: <LoginPage /> },
  { path: "register", element: <RegisterPage /> },
  { path: "forgot-password", element: <ForgotPasswordPage /> },
  { path: "reset-password/:token", element: <ResetPasswordPage /> },
  { path: "*", element: <NotFoundPage /> },
];
