import type { AddressInterface } from "~/types/Order";
import type { CheckoutState, Country, OrderLineItem, OrderSummary } from "~/modules/checkout-opc/types";

export interface CheckoutApi {
    getCheckoutAddresses(token: string): Promise<AddressInterface[]>;

    getCountries(): Promise<Country[]>;

    getCheckoutItems(token: string): Promise<OrderLineItem[]>;

    getOrderSummary(token: string): Promise<OrderSummary>;

    syncCheckout(token: string, state: CheckoutState): Promise<OrderSummary>;
}

export { checkoutApiMock as checkoutApi } from "./checkoutApi.mock";
