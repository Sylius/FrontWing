import React from "react";
import type { CheckoutPaymentMethod } from "~/types/Checkout";
import { useCheckout } from "~/context/CheckoutContext";
import MethodLogo from "./MethodLogo";

interface Props {
    methods: CheckoutPaymentMethod[];
}

const PaymentMethodSection: React.FC<Props> = ({ methods }) => {
    const { state, setPaymentMethod } = useCheckout();

    return (
        <fieldset className="mb-5">
            <legend className="h5 mb-4">Payments</legend>

            {methods.length === 0 ? (
                <div className="text-danger">No payment methods available for your order.</div>
            ) : (
                methods.map((method, index) => (
                    <div key={method.code} className={index > 0 ? "border-top" : undefined}>
                        <label className="d-flex align-items-center gap-3 card-body py-2 checkout-method-tile">
                            <input
                                type="radio"
                                id={`opc-payment-${method.code}`}
                                name="opcPaymentMethod"
                                className="form-check-input flex-shrink-0 mt-0 ms-2"
                                value={method.code}
                                checked={state.paymentMethodCode === method.code}
                                disabled={!method.enabled}
                                onChange={() => setPaymentMethod(method.code)}
                            />

                            <MethodLogo src={method.logoUrl} alt={method.name} />

                            <div className="flex-grow-1">
                                <div className="h6 mb-0">{method.name}</div>
                            </div>
                        </label>
                    </div>
                ))
            )}
        </fieldset>
    );
};

export default PaymentMethodSection;
