import { useOrder } from "../../../context/OrderContext";
import { getUnitPrices } from "../../../utils/price";
import { useCurrency } from "~/context/ChannelContext";
import { OrderItem } from "../../../types/Order";
import React from "react";
import { useTranslation } from "react-i18next";

const Sidebar: React.FC = () => {
    const { t } = useTranslation("checkout");
    const { formatPrice } = useCurrency();
    const { order, activeCouponCode } = useOrder();

    const hasDiscount =
        typeof order?.orderPromotionTotal === "number" &&
        order.orderPromotionTotal !== 0;

    return (
        <div className="col-12 col-lg-5 py-5 ps-lg-6 position-relative checkout-sidebar">
            <div>
                <div className="mb-4 h2">{t("sidebar.summary")}</div>

                <table className="table mb-3">
                    <tbody>
                    {order?.items?.map((orderItem: OrderItem) => {
                        const { originalUnitPrice, currentUnitPrice, hasDiscount } =
                            getUnitPrices(orderItem);

                        return (
                        <tr key={orderItem.id}>
                            <td>
                                <div className="py-3 h6 mb-0 text-break">
                                    {orderItem.productName}
                                </div>
                            </td>
                            <td>
                                <div className="py-3 text-end text-body-tertiary">
                                    {orderItem.quantity}
                                </div>
                            </td>
                            <td>
                                <div className="py-3 text-end">
                                    {hasDiscount ? (
                                        <span className="d-inline-flex align-items-center gap-2">
                                            <span className="text-black-50 text-decoration-line-through">
                                                {formatPrice(originalUnitPrice)}
                                            </span>
                                            <span>{formatPrice(currentUnitPrice)}</span>
                                        </span>
                                    ) : (
                                        <span>{formatPrice(currentUnitPrice)}</span>
                                    )}
                                </div>
                            </td>
                        </tr>
                        );
                    })}
                    </tbody>
                </table>

                <table className="table table-borderless mb-3">
                    <tbody>
                    <tr>
                        <td>{t("sidebar.itemsTotal")}</td>
                        <td className="text-end">
                            {formatPrice(order?.itemsSubtotal)}
                        </td>
                    </tr>

                    {hasDiscount && (
                        <tr>
                            <td>{t("sidebar.discount")}</td>
                            <td className="text-end">
                                -{formatPrice(Math.abs(order.orderPromotionTotal!))}
                            </td>
                        </tr>
                    )}

                    <tr>
                        <td>{t("sidebar.estimatedShipping")}</td>
                        <td className="text-end">
                            {formatPrice(order?.shippingTotal)}
                        </td>
                    </tr>
                    <tr>
                        <td className="pb-4">{t("sidebar.taxesTotal")}</td>
                        <td className="pb-4 text-end">
                            {formatPrice(order?.taxTotal)}
                        </td>
                    </tr>
                    <tr>
                        <td className="border-top pt-4 h5">{t("sidebar.orderTotal")}</td>
                        <td className="border-top pt-4 text-end h5">
                            {formatPrice(order?.total)}
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Sidebar;
