import type { AddressInterface, Order } from "~/types/Order";
import type { CheckoutState, Country, OrderSummary } from "~/modules/checkout-opc/types";

export interface CheckoutViolation {
    propertyPath: string;
    message: string;
}

export class CheckoutCompleteError extends Error {
    constructor(
        message: string,
        readonly status: number,
        readonly violations: CheckoutViolation[] = [],
    ) {
        super(message);
        this.name = "CheckoutCompleteError";
    }
}

export interface CheckoutApi {
    getCheckoutAddresses(token: string): Promise<AddressInterface[]>;

    getCountries(): Promise<Country[]>;

    syncCheckout(token: string, state: CheckoutState): Promise<OrderSummary>;

    completeCheckout(token: string, state: CheckoutState, hash: string): Promise<Order>;
}

export { checkoutApiLive as checkoutApi } from "./checkoutApi.live";
