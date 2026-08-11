import { redirect, type LoaderFunctionArgs } from "react-router";
import { localizePath } from "~/utils/localizedPath";

export const loader = ({ params }: LoaderFunctionArgs) =>
    redirect(localizePath(params.lang!, "/checkout/address"));

export default function CheckoutRedirect() {
    return null;
}
