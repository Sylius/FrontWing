import type { AddressInterface } from "~/types/Order";
import type { CheckoutState } from "~/types/Checkout";

const REQUIRED_ADDRESS_FIELDS: (keyof AddressInterface)[] = [
    "firstName",
    "lastName",
    "phoneNumber",
    "street",
    "countryCode",
    "city",
    "postcode",
];

export const isAddressComplete = (address: AddressInterface): boolean =>
    REQUIRED_ADDRESS_FIELDS.every((field) => {
        const value = address[field];
        return typeof value === "string" && value.trim() !== "";
    });

// "Pay now securely" is enabled only when the order is actually payable: a complete
// billing address (and shipping address when it differs), both methods chosen, at least
// one item, and no recalculation in flight (§10 pkt 5).
export const canSubmitCheckout = (state: CheckoutState, isRecalculating: boolean): boolean => {
    if (isRecalculating) return false;
    if (!isAddressComplete(state.billingAddress)) return false;
    if (state.useDifferentShipping && !isAddressComplete(state.shippingAddress)) return false;
    if (!state.shippingMethodCode || !state.paymentMethodCode) return false;
    if (state.items.length === 0) return false;

    return true;
};
