export const handle = { i18n: ["common","checkout"] };

import React, { useState } from "react";
import CheckoutLayout from "~/layouts/Checkout";
import { useOrder } from "~/context/OrderContext";
import { useLocalizedNavigate } from "~/hooks/useLocalizedNavigate";
import Steps from "~/components/checkout/Steps";
import Address from "~/components/Address";
import PaymentsCard from "~/components/order/PaymentsCard";
import ShipmentsCard from "~/components/order/ShipmentsCard";
import ProductRow from "~/components/order/ProductRow";
import { OrderItem } from "~/types/Order";
import { useCurrency } from "~/context/ChannelContext";
import { useTranslation } from "react-i18next";

const SummaryPage: React.FC = () => {
  const { t } = useTranslation("checkout");
  const { formatPrice } = useCurrency();
  const { order, resetCart, setOrderToken } = useOrder();
  const navigate = useLocalizedNavigate();
  const [extraNotes, setExtraNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!order?.tokenValue) {
      console.warn("Missing order token");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
          `${window.ENV?.API_URL}/api/v2/shop/orders/${order.tokenValue}/complete`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/merge-patch+json" },
            body: JSON.stringify({ notes: extraNotes }),
          }
      );

      const responseText = await response.text();

      if (!response.ok) {
        alert(t("summary.checkoutError") + "\n" + responseText);
        throw new Error("Failed to complete order");
      }

      resetCart();

      const res = await fetch(`${window.ENV?.API_URL}/api/v2/shop/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });

      const newOrder = await res.json();
      const newToken = newOrder.tokenValue;

      document.cookie = `orderToken=${newToken}; path=/; max-age=2592000; SameSite=Lax`;
      setOrderToken(newToken);

      navigate("/order/thank-you", { state: { tokenValue: order.tokenValue } });
    } catch (error) {
      console.error("Error submitting order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <CheckoutLayout sidebarOn={false}>
        <div className="col pt-4 pb-5">
          <div className="mx-auto">
            <Steps activeStep="complete" />
            <h1 className="h5 mb-4">{t("summary.orderNumber", { number: order?.number })}</h1>

            <form onSubmit={handleSubmit} noValidate>
              <div className="row">
                <div className="col-12 col-md-6 mb-3">
                  {order?.billingAddress && (
                      <Address sectionName={t("summary.billingAddress")} address={order.billingAddress} />
                  )}
                </div>
                <div className="col-12 col-md-6 mb-3">
                  {order?.shippingAddress && (
                      <Address sectionName={t("summary.shippingAddress")} address={order.shippingAddress} />
                  )}
                </div>
              </div>

              <div className="mb-5">
                {order?.payments?.[0] && (
                    <PaymentsCard
                        payment={order.payments[0]}
                        total={order?.total ?? 0}
                        paymentState={order?.paymentState}
                    />
                )}
                {order?.shipments?.[0] && <ShipmentsCard shipment={order.shipments[0]} />}
              </div>

              <div className="table-responsive border-bottom mb-4">
                <table className="table table-borderless table-space align-middle mb-0">
                  <thead>
                  <tr>
                    <th>{t("summary.item")}</th>
                    <th className="text-end">{t("summary.unitPrice")}</th>
                    <th className="text-end">{t("summary.qty")}</th>
                    <th className="text-end">{t("summary.subtotal")}</th>
                  </tr>
                  </thead>
                  <tbody>
                  {order?.items?.map((item: OrderItem) => (
                      <ProductRow orderItem={item} key={item.id} />
                  ))}
                  </tbody>
                </table>
              </div>

              <table className="table table-borderless align-middle ms-auto mb-6">
                <tbody>
                <tr>
                  <td className="text-end w-75">{t("summary.itemsTotal")}</td>
                  <td className="text-end">{formatPrice(order?.itemsSubtotal ?? 0)}</td>
                </tr>
                <tr>
                  <td className="text-end w-75">{t("summary.taxesTotal")}</td>
                  <td className="text-end">
                    <div>{formatPrice(order?.taxTotal ?? 0)}</div>
                    <small className="text-body-tertiary">{t("summary.includedInPrice")}</small>
                  </td>
                </tr>
                <tr>
                  <td className="text-end w-75">{t("summary.discount")}</td>
                  <td className="text-end">{formatPrice(order?.orderPromotionTotal ?? 0)}</td>
                </tr>
                <tr>
                  <td className="text-end w-75">{t("summary.shippingTotal")}</td>
                  <td className="text-end">{formatPrice(order?.shippingTotal ?? 0)}</td>
                </tr>
                <tr>
                  <td className="h5 text-end border-top pt-4 mt-3">{t("summary.total")}</td>
                  <td className="h5 text-end border-top pt-4 mt-3">
                    {formatPrice(order?.total ?? 0)}
                  </td>
                </tr>
                </tbody>
              </table>

              <div className="field mb-3">
                <label htmlFor="sylius_checkout_complete_notes" className="form-label">
                  {t("summary.extraNotes")}
                </label>
                <textarea
                    id="sylius_checkout_complete_notes"
                    className="form-control"
                    value={extraNotes}
                    onChange={(e) => setExtraNotes(e.target.value)}
                />
              </div>

              <div className="text-center">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? t("summary.placingOrder") : t("summary.placeOrder")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </CheckoutLayout>
  );
};

export default SummaryPage;
