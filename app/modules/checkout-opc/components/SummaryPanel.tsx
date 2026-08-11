import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { IconCalendarMonth, IconLock } from "@tabler/icons-react";
import type { OrderLineItem, OrderSummary } from "~/modules/checkout-opc/types";
import { formatMoney } from "~/utils/price";
import { formatDeliveryRange } from "~/modules/checkout-opc/utils/deliveryEstimate";
import OrderItemsSection from "./OrderItemsSection";
import CouponRow from "./CouponRow";

interface Props {
    items: OrderLineItem[];
    summary: OrderSummary;
    recalculating: boolean;
    canPay: boolean;
    submitting: boolean;
    errorMessage: string | null;
    onPay: () => void;
}

const SummaryPanel: React.FC<Props> = ({
    items,
    summary,
    recalculating,
    canPay,
    submitting,
    errorMessage,
    onPay,
}) => {
    const { t } = useTranslation("checkout");
    const { currencyCode, totals, estimatedDelivery, securePayments } = summary;

    return (
        <div className="card border-0 shadow-soft mb-3" aria-busy={recalculating}>
            <div className="card-body">
                <OrderItemsSection items={items} currencyCode={currencyCode} />

                <hr />

                <div className="h2 mb-4">{t("opc.summary.title")}</div>

                <table className="table table-borderless table-sm mb-3">
                    <tbody>
                        <tr>
                            <td>{t("opc.summary.subtotal", { itemsCount: totals.itemsCount })}</td>
                            <td className="text-end">{formatMoney(totals.itemsSubtotal, currencyCode)}</td>
                        </tr>
                        <tr>
                            <td>{t("opc.summary.estimatedShipping")}</td>
                            <td className="text-end">{formatMoney(totals.shippingTotal, currencyCode)}</td>
                        </tr>
                        {totals.shippingDiscountTotal !== 0 && (
                            <tr>
                                <td>{t("opc.summary.shippingDiscount")}</td>
                                <td className="text-end">
                                    {formatMoney(totals.shippingDiscountTotal, currencyCode)}
                                </td>
                            </tr>
                        )}
                        {totals.discountTotal !== 0 && (
                            <tr>
                                <td>{t("opc.summary.discount")}</td>
                                <td className="text-end">{formatMoney(totals.discountTotal, currencyCode)}</td>
                            </tr>
                        )}
                        {totals.taxTotal !== 0 && (
                            <tr>
                                <td>{t("opc.summary.taxesTotal")}</td>
                                <td className="text-end">{formatMoney(totals.taxTotal, currencyCode)}</td>
                            </tr>
                        )}
                        <tr>
                            <td className="pb-3" colSpan={2}>
                                <CouponRow />
                            </td>
                        </tr>
                        <tr>
                            <td className="border-top pt-3 h5">{t("opc.summary.total")}</td>
                            <td className="border-top pt-3 text-end h5">
                                {formatMoney(totals.total, currencyCode)}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {estimatedDelivery && (
                    <div className="d-flex align-items-center gap-2 mb-4 small">
                        <IconCalendarMonth className="icon icon-sm flex-shrink-0" stroke={2} />
                        {t("opc.summary.estimatedDelivery", {
                            range: formatDeliveryRange(estimatedDelivery),
                        })}
                    </div>
                )}

                {errorMessage && (
                    <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">
                        {errorMessage}
                    </div>
                )}

                <button
                    type="button"
                    className="btn btn-primary w-100 mb-3"
                    disabled={!canPay}
                    onClick={onPay}
                >
                    {recalculating || submitting ? (
                        <>
                            <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                            />
                            {submitting
                                ? t("opc.summary.placingOrder")
                                : t("opc.summary.recalculating")}
                        </>
                    ) : (
                        t("opc.summary.payNow")
                    )}
                </button>

                {securePayments && (
                    <div className="d-flex align-items-center justify-content-center flex-wrap gap-2 text-body-tertiary small">
                        <IconLock className="icon icon-xs" stroke={2} />
                        <span>
                            <Trans
                                i18nKey="opc.summary.securePayments"
                                t={t}
                                values={{ provider: securePayments.provider }}
                                components={{ strong: <strong /> }}
                            />
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SummaryPanel;
