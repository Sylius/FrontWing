import React from "react";
import type { CheckoutPaymentMethod } from "~/types/Checkout";
import MethodLogo from "./MethodLogo";

interface Props {
    methods: CheckoutPaymentMethod[];
    selectedCode: string | null;
}

const PaymentMethodSection: React.FC<Props> = ({ methods, selectedCode }) => (
    <fieldset className="mb-5">
        <legend className="h5 mb-4">Payments</legend>

        {methods.length === 0 ? (
            <div className="text-danger">No payment methods available for your order.</div>
        ) : (
            methods.map((method) => (
                <div key={method.code} className="card bg-body-tertiary border-0 mb-3">
                    <label className="d-flex align-items-center gap-3 card-body">
                        <input
                            type="radio"
                            id={`opc-payment-${method.code}`}
                            name="opcPaymentMethod"
                            className="form-check-input flex-shrink-0 mt-0"
                            value={method.code}
                            checked={selectedCode === method.code}
                            disabled={!method.enabled}
                            readOnly
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

export default PaymentMethodSection;
