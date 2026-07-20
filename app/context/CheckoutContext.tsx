import React, { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import type { AddressInterface } from "~/types/Order";
import type {
    AddressFieldName,
    CheckoutState,
    OrderLineItem,
    OrderSummary,
} from "~/types/Checkout";

export type AddressScope = "billing" | "shipping";

export type CheckoutAction =
    | { type: "SET_EMAIL"; email: string }
    | { type: "SET_ADDRESS_FIELD"; scope: AddressScope; field: AddressFieldName; value: string }
    | { type: "SELECT_ADDRESS"; scope: AddressScope; address: AddressInterface }
    | { type: "SET_USE_DIFFERENT_SHIPPING"; enabled: boolean }
    | { type: "SET_SHIPPING_METHOD"; code: string | null }
    | { type: "SET_PAYMENT_METHOD"; code: string | null }
    | { type: "SET_COUPON"; code: string | null }
    | { type: "REMOVE_ITEM"; id: number };

interface CheckoutContextType {
    state: CheckoutState;
    setEmail: (email: string) => void;
    setAddressField: (scope: AddressScope, field: AddressFieldName, value: string) => void;
    selectAddress: (scope: AddressScope, address: AddressInterface) => void;
    setUseDifferentShipping: (enabled: boolean) => void;
    setShippingMethod: (code: string | null) => void;
    setPaymentMethod: (code: string | null) => void;
    setCoupon: (code: string | null) => void;
    removeItem: (id: number) => void;
}

interface InitialStateInput {
    addresses: AddressInterface[];
    items: OrderLineItem[];
    summary: OrderSummary;
    email?: string;
}

const getAddress = (state: CheckoutState, scope: AddressScope): AddressInterface =>
    scope === "billing" ? state.billingAddress : state.shippingAddress;

const withAddress = (
    state: CheckoutState,
    scope: AddressScope,
    address: AddressInterface,
): CheckoutState =>
    scope === "billing"
        ? { ...state, billingAddress: address }
        : { ...state, shippingAddress: address };

const isBlankAddress = (address: AddressInterface): boolean =>
    Object.values(address).every((value) => value === undefined || value === "");

export const createInitialCheckoutState = ({
    addresses,
    items,
    summary,
    email,
}: InitialStateInput): CheckoutState => {
    const defaultAddress = addresses[0];

    return {
        email: email ?? defaultAddress?.email ?? "",
        billingAddress: defaultAddress ? { ...defaultAddress } : {},
        shippingAddress: {},
        useDifferentShipping: false,
        items: items.map(({ id, quantity }) => ({ id, quantity })),
        shippingMethodCode: summary.selectedShippingMethod,
        paymentMethodCode: summary.selectedPaymentMethod,
        couponCode: null,
    };
};

export const checkoutReducer = (state: CheckoutState, action: CheckoutAction): CheckoutState => {
    switch (action.type) {
        case "SET_EMAIL":
            return { ...state, email: action.email };

        case "SET_ADDRESS_FIELD": {
            const next: AddressInterface = {
                ...getAddress(state, action.scope),
                [action.field]: action.value,
            };
            // An edited address is no longer the address book entry it came from.
            delete next.id;
            return withAddress(state, action.scope, next);
        }

        case "SELECT_ADDRESS":
            return withAddress(state, action.scope, { ...action.address });

        case "SET_USE_DIFFERENT_SHIPPING": {
            if (!action.enabled) return { ...state, useDifferentShipping: false };

            return {
                ...state,
                useDifferentShipping: true,
                shippingAddress: isBlankAddress(state.shippingAddress)
                    ? { ...state.billingAddress }
                    : state.shippingAddress,
            };
        }

        case "SET_SHIPPING_METHOD":
            return { ...state, shippingMethodCode: action.code };

        case "SET_PAYMENT_METHOD":
            return { ...state, paymentMethodCode: action.code };

        case "SET_COUPON":
            return { ...state, couponCode: action.code };

        case "REMOVE_ITEM":
            return { ...state, items: state.items.filter((item) => item.id !== action.id) };

        default:
            return state;
    }
};

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider: React.FC<{
    initialState: CheckoutState;
    children: React.ReactNode;
}> = ({ initialState, children }) => {
    const [state, dispatch] = useReducer(checkoutReducer, initialState);

    const setEmail = useCallback((email: string) => {
        dispatch({ type: "SET_EMAIL", email });
    }, []);

    const setAddressField = useCallback(
        (scope: AddressScope, field: AddressFieldName, value: string) => {
            dispatch({ type: "SET_ADDRESS_FIELD", scope, field, value });
        },
        [],
    );

    const selectAddress = useCallback((scope: AddressScope, address: AddressInterface) => {
        dispatch({ type: "SELECT_ADDRESS", scope, address });
    }, []);

    const setUseDifferentShipping = useCallback((enabled: boolean) => {
        dispatch({ type: "SET_USE_DIFFERENT_SHIPPING", enabled });
    }, []);

    const setShippingMethod = useCallback((code: string | null) => {
        dispatch({ type: "SET_SHIPPING_METHOD", code });
    }, []);

    const setPaymentMethod = useCallback((code: string | null) => {
        dispatch({ type: "SET_PAYMENT_METHOD", code });
    }, []);

    const setCoupon = useCallback((code: string | null) => {
        dispatch({ type: "SET_COUPON", code });
    }, []);

    const removeItem = useCallback((id: number) => {
        dispatch({ type: "REMOVE_ITEM", id });
    }, []);

    const value = useMemo(
        () => ({
            state,
            setEmail,
            setAddressField,
            selectAddress,
            setUseDifferentShipping,
            setShippingMethod,
            setPaymentMethod,
            setCoupon,
            removeItem,
        }),
        [
            state,
            setEmail,
            setAddressField,
            selectAddress,
            setUseDifferentShipping,
            setShippingMethod,
            setPaymentMethod,
            setCoupon,
            removeItem,
        ],
    );

    return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
};

export const useCheckout = (): CheckoutContextType => {
    const context = useContext(CheckoutContext);
    if (!context) {
        throw new Error("useCheckout must be used within a CheckoutProvider");
    }
    return context;
};
