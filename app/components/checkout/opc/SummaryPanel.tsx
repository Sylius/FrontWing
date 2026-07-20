import React from "react";
import { IconCalendarMonth, IconLock } from "@tabler/icons-react";
import type { OrderLineItem, OrderSummary } from "~/types/Checkout";
import { formatMoney } from "~/utils/price";
import { formatDeliveryRange } from "~/utils/deliveryEstimate";
import OrderItemsSection from "./OrderItemsSection";
import CouponRow from "./CouponRow";

interface Props {
    items: OrderLineItem[];
    summary: OrderSummary;
    recalculating: boolean;
    canPay: boolean;
}

const SummaryPanel: React.FC<Props> = ({ items, summary, recalculating, canPay }) => {
    const { currencyCode, totals, estimatedDelivery, securePayments } = summary;

    return (
        <div className="card border-0 shadow-soft mb-3" aria-busy={recalculating}>
            <div className="card-body">
                <OrderItemsSection items={items} currencyCode={currencyCode} />

                <hr />

                <div className="h2 mb-4">Summary</div>

                <table className="table table-borderless table-sm mb-3">
                    <tbody>
                        <tr>
                            <td>Subtotal price ({totals.itemsCount} items)</td>
                            <td className="text-end">{formatMoney(totals.itemsSubtotal, currencyCode)}</td>
                        </tr>
                        <tr>
                            <td>Estimated shipping cost</td>
                            <td className="text-end">{formatMoney(totals.shippingTotal, currencyCode)}</td>
                        </tr>
                        {totals.discountTotal !== 0 && (
                            <tr>
                                <td>Discount</td>
                                <td className="text-end">{formatMoney(totals.discountTotal, currencyCode)}</td>
                            </tr>
                        )}
                        {totals.taxTotal !== 0 && (
                            <tr>
                                <td>Taxes total</td>
                                <td className="text-end">{formatMoney(totals.taxTotal, currencyCode)}</td>
                            </tr>
                        )}
                        <tr>
                            <td className="pb-3" colSpan={2}>
                                <CouponRow />
                            </td>
                        </tr>
                        <tr>
                            <td className="border-top pt-3 h5">Total</td>
                            <td className="border-top pt-3 text-end h5">
                                {formatMoney(totals.total, currencyCode)}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {estimatedDelivery && (
                    <div className="d-flex align-items-center gap-2 mb-4 small">
                        <IconCalendarMonth className="icon icon-sm flex-shrink-0" stroke={2} />
                        Estimated delivery: {formatDeliveryRange(estimatedDelivery)}
                    </div>
                )}

                <button
                    type="button"
                    className="btn btn-primary w-100 mb-3"
                    disabled={!canPay}
                >
                    {recalculating ? (
                        <>
                            <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                            />
                            Recalculating...
                        </>
                    ) : (
                        "Pay now securely"
                    )}
                </button>

                {securePayments && (
                    <div className="d-flex align-items-center justify-content-center flex-wrap gap-2 text-body-tertiary small">
                        <IconLock className="icon icon-xs" stroke={2} />
                        <span>
                            Secure payments by <strong>{securePayments.provider}</strong>
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SummaryPanel;
