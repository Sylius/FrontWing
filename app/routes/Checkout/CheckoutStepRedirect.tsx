import { redirect } from "react-router";

export const loader = () => redirect("/checkout");

export default function CheckoutStepRedirect() {
    return null;
}
