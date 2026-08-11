import React from "react";
import { useTranslation } from "react-i18next";
import { IconAlertTriangle, IconCalendarMonth } from "@tabler/icons-react";
import type { CheckoutShippingMethod } from "~/modules/checkout-opc/types";
import { useCheckout } from "~/modules/checkout-opc/context/CheckoutContext";
import { formatMoney } from "~/utils/price";
import { formatDeliveryRange } from "~/modules/checkout-opc/utils/deliveryEstimate";
import MethodLogo from "./MethodLogo";

interface Props {
    methods: CheckoutShippingMethod[];
    currencyCode: string;
    changedNotice?: boolean;
}

const ShippingMethodSection: React.FC<Props> = ({ methods, currencyCode, changedNotice }) => {
    const { state, setShippingMethod } = useCheckout();
    const { t } = useTranslation("checkout");

    return (
        <fieldset className="mb-5">
            <legend className="h5 mb-4">{t("opc.shipping.legend")}</legend>

            {changedNotice && (
                <div className="alert alert-warning d-flex align-items-center gap-2" role="alert">
                    <IconAlertTriangle className="icon icon-sm flex-shrink-0" stroke={2} />
                    <span>{t("opc.shipping.methodsChanged")}</span>
                </div>
            )}

            {methods.length === 0 ? (
                <div className="text-danger">{t("opc.shipping.noMethods")}</div>
            ) : (
                methods.map((method, index) => (
                    <div key={method.code} className={index > 0 ? "border-top" : undefined}>
                        <label className="d-flex align-items-center gap-3 card-body py-2 checkout-method-tile">
                            <input
                                type="radio"
                                id={`opc-shipping-${method.code}`}
                                name="opcShippingMethod"
                                className="form-check-input flex-shrink-0 mt-0 ms-2"
                                value={method.code}
                                checked={state.shippingMethodCode === method.code}
                                disabled={!method.enabled}
                                onChange={() => setShippingMethod(method.code)}
                            />

                            <MethodLogo src={method.logoUrl} alt={method.name} />

                            <div className="flex-grow-1">
                                <div className="h6 mb-0">{method.name}</div>
                                {method.estimatedDelivery && (
                                    <div className="d-flex align-items-center gap-1 text-body-tertiary small">
                                        <IconCalendarMonth className="icon icon-xs" stroke={2} />
                                        {t("opc.shipping.estimatedDelivery", {
                                            range: formatDeliveryRange(method.estimatedDelivery),
                                        })}
                                    </div>
                                )}
                            </div>

                            {method.price !== undefined && (
                                <div className="text-end">
                                    <div>{formatMoney(method.price, currencyCode)}</div>
                                    {method.originalPrice !== undefined && (
                                        <del className="text-body-tertiary small">
                                            {formatMoney(method.originalPrice, currencyCode)}
                                        </del>
                                    )}
                                </div>
                            )}
                        </label>
                    </div>
                ))
            )}
        </fieldset>
    );
};

export default ShippingMethodSection;
