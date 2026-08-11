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

// "Pay now securely" is enabled only when the order is actually payable: a valid email,
// a complete billing address (and shipping address when it differs), both methods chosen,
// at least one item, and no recalculation in flight (§10 pkt 5).
export const canSubmitCheckout = (state: CheckoutState, isRecalculating: boolean): boolean => {
    if (isRecalculating) return false;
    if (!isEmailValid(state.email)) return false;
    if (!isAddressComplete(state.billingAddress)) return false;
    if (state.useDifferentShipping && !isAddressComplete(state.shippingAddress)) return false;
    if (!state.shippingMethodCode || !state.paymentMethodCode) return false;
    if (state.items.length === 0) return false;

    return true;
};
