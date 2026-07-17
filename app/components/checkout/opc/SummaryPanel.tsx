import React from "react";
import { IconCalendarMonth, IconGift, IconInfoCircle, IconLock } from "@tabler/icons-react";
import type { OrderLineItem, OrderSummary } from "~/types/Checkout";
import { formatMoney } from "~/utils/price";
import { formatDeliveryRange } from "~/utils/deliveryEstimate";
import OrderItemsSection from "./OrderItemsSection";
import CouponRow from "./CouponRow";

interface Props {
    items: OrderLineItem[];
    summary: OrderSummary;
}

const SummaryPanel: React.FC<Props> = ({ items, summary }) => {
    const { currencyCode, totals, loyalty, estimatedDelivery, securePayments } = summary;

    return (
        <div className="card bg-body-tertiary border-0 mb-3">
            <div className="card-body">
                <OrderItemsSection items={items} currencyCode={currencyCode} />

                <hr />

                <div className="h2 mb-4">Summary</div>

                <table className="table table-borderless mb-3">
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

                {loyalty && (
                    <div className="d-flex align-items-start gap-2 mb-3 small">
                        <IconGift className="icon icon-sm flex-shrink-0" stroke={2} />
                        <span>
                            You will receive {loyalty.points} points (i.e. {loyalty.value} {loyalty.currency}) in
                            the <strong>{loyalty.clubName}</strong>
                        </span>
                        <IconInfoCircle className="icon icon-sm flex-shrink-0 text-body-tertiary" stroke={2} />
                    </div>
                )}

                {estimatedDelivery && (
                    <div className="d-flex align-items-center gap-2 mb-4 small">
                        <IconCalendarMonth className="icon icon-sm flex-shrink-0" stroke={2} />
                        Estimated delivery: {formatDeliveryRange(estimatedDelivery)}
                    </div>
                )}

                <button type="button" className="btn btn-primary w-100 mb-3" disabled>
                    Pay now securely
                </button>

                {securePayments && (
                    <div className="d-flex align-items-center justify-content-center flex-wrap gap-2 text-body-tertiary small">
                        <IconLock className="icon icon-xs" stroke={2} />
                        <span>
                            Secure payments by <strong>{securePayments.provider}</strong>
                        </span>
                        <span className="text-uppercase">{securePayments.cardBrands.join(" · ")}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SummaryPanel;
