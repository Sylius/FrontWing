import { redirect } from "react-router";

export const loader = () => redirect("/checkout/address");

export default function CheckoutRedirect() {
    return null;
}
