import type { AddressInterface } from "~/types/Order";
import type { CheckoutState, OrderLineItem, OrderSummary } from "~/types/Checkout";

export interface CheckoutApi {
    getCheckoutAddresses(token: string): Promise<AddressInterface[]>;

    getCheckoutItems(token: string): Promise<OrderLineItem[]>;

    getOrderSummary(token: string): Promise<OrderSummary>;

    syncCheckout(token: string, state: CheckoutState): Promise<OrderSummary>;
}

export { checkoutApiMock as checkoutApi } from "./checkoutApi.mock";
