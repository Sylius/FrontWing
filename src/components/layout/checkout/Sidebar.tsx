import { useOrder } from "../../../context/OrderContext";
import { formatPrice } from "../../../utils/price";
import { OrderItem } from "../../../types/Order";
import React from "react";

const Sidebar: React.FC = () => {
    const { order } = useOrder();

    const isCouponApplied = !!order?.orderPromotionTotal && order.orderPromotionTotal !== 0;

    return (
        <div className="col-12 col-lg-5 py-5 ps-lg-6 position-relative checkout-sidebar">
            <div>
                <div className="mb-4 h2">Summary</div>
                <table className="table mb-3">
                    <tbody>
                    {order?.items?.map((orderItem: OrderItem) => (
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
                                    ${formatPrice(orderItem.subtotal)}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <table className="table table-borderless mb-3">
                    <tbody>
                    <tr>
                        <td>Items total:</td>
                        <td className="text-end">${formatPrice(order?.itemsSubtotal)}</td>
                    </tr>

                    {isCouponApplied && (
                        <tr>
                            <td>Discount:</td>
                            <td className="text-end ">
                                ${formatPrice(order?.orderPromotionTotal)}
                            </td>
                        </tr>
                    )}

                    <tr>
                        <td>Estimated shipping cost:</td>
                        <td className="text-end">
                            <span>${formatPrice(order?.shippingTotal)}</span>
                        </td>
                    </tr>
                    <tr>
                        <td className="pb-4">Taxes total:</td>
                        <td className="pb-4 text-end">
                            <div>${formatPrice(order?.taxTotal)}</div>
                        </td>
                    </tr>
                    <tr>
                        <td className="border-top pt-4 h5">Order total:</td>
                        <td className="border-top pt-4 text-end h5">
                            ${formatPrice(order?.total)}
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Sidebar;
