import { RouteObject } from "react-router-dom";

import AddAddressPage from "../pages/account/AddAddressPage";
import AddressBookPage from "../pages/account/AddressBookPage";
import ChangePasswordPage from "../pages/account/ChangePasswordPage";
import DashboardPage from "../pages/account/DashboardPage";
import EditAddressPage from "../pages/account/EditAddressPage";
import OrderDetailsPage from "../pages/account/OrderDetailsPage";
import OrderHistoryPage from "../pages/account/OrderHistoryPage";
import ProfilePage from "../pages/account/ProfilePage";
import RequireAuth from "./guards/RequireAuth.tsx";

export const accountRoutes: RouteObject = {
  path: "account",
  element: <RequireAuth />,
  children: [
    { path: "dashboard", element: <DashboardPage /> },
    { path: "profile/edit", element: <ProfilePage /> },
    { path: "change-password", element: <ChangePasswordPage /> },
    { path: "order-history", element: <OrderHistoryPage /> },
    { path: "orders/:token", element: <OrderDetailsPage /> },
    { path: "address-book", element: <AddressBookPage /> },
    { path: "address-book/add", element: <AddAddressPage /> },
    { path: "address-book/edit/:id", element: <EditAddressPage /> },
  ],
};
