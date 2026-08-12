import type { AddressInterface } from "~/types/Order";
import type { CheckoutState } from "~/modules/checkout-opc/types";

const REQUIRED_ADDRESS_FIELDS: (keyof AddressInterface)[] = [
    "firstName",
    "lastName",
    "phoneNumber",
    "street",
    "countryCode",
    "city",
    "postcode",
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isAddressComplete = (address: AddressInterface): boolean =>
    REQUIRED_ADDRESS_FIELDS.every((field) => {
        const value = address[field];
        return typeof value === "string" && value.trim() !== "";
    });

export const isEmailValid = (email: string): boolean => EMAIL_PATTERN.test(email.trim());

export const canSubmitCheckout = (state: CheckoutState, isRecalculating: boolean): boolean => {
    if (isRecalculating) return false;
    if (!isEmailValid(state.email)) return false;
    if (!isAddressComplete(state.billingAddress)) return false;
    if (state.useDifferentShipping && !isAddressComplete(state.shippingAddress)) return false;
    if (!state.shippingMethodCode || !state.paymentMethodCode) return false;
    if (state.items.length === 0) return false;

    return true;
};
