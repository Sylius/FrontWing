import React from "react";
import { IconCalendarMonth } from "@tabler/icons-react";
import type { CheckoutShippingMethod } from "~/types/Checkout";
import { formatMoney } from "~/utils/price";
import { formatDeliveryRange } from "~/utils/deliveryEstimate";
import MethodLogo from "./MethodLogo";

interface Props {
    methods: CheckoutShippingMethod[];
    selectedCode: string | null;
    currencyCode: string;
}

const ShippingMethodSection: React.FC<Props> = ({ methods, selectedCode, currencyCode }) => (
    <fieldset className="mb-5">
        <legend className="h5 mb-4">Shipping</legend>

        {methods.length === 0 ? (
            <div className="text-danger">No shipping methods available. Check your address.</div>
        ) : (
            methods.map((method) => (
                <div key={method.code} className="card bg-body-tertiary border-0 mb-3">
                    <label className="d-flex align-items-center gap-3 card-body">
                        <input
                            type="radio"
                            id={`opc-shipping-${method.code}`}
                            name="opcShippingMethod"
                            className="form-check-input flex-shrink-0 mt-0"
                            value={method.code}
                            checked={selectedCode === method.code}
                            disabled={!method.enabled}
                            readOnly
                        />

                        <MethodLogo src={method.logoUrl} alt={method.name} />

                        <div className="flex-grow-1">
                            <div className="h6 mb-0">{method.name}</div>
                            {method.estimatedDelivery && (
                                <div className="d-flex align-items-center gap-1 text-body-tertiary small">
                                    <IconCalendarMonth className="icon icon-xs" stroke={2} />
                                    Estimated delivery: {formatDeliveryRange(method.estimatedDelivery)}
                                </div>
                            )}
                        </div>

                        <div className="text-end">
                            <div>{formatMoney(method.price, currencyCode)}</div>
                            {method.originalPrice !== undefined && (
                                <del className="text-body-tertiary small">
                                    {formatMoney(method.originalPrice, currencyCode)}
                                </del>
                            )}
                        </div>
                    </label>
                </div>
            ))
        )}
    </fieldset>
);

export default ShippingMethodSection;
