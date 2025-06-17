import React, { useEffect, useState } from "react";
import CheckoutLayout from "../../layouts/Checkout";
import { useOrder } from "../../context/OrderContext";
import { useNavigate } from "react-router-dom";
import Steps from "../../components/checkout/Steps";
import Address from "../../components/Address";
import PaymentsCard from "../../components/order/PaymentsCard";
import ShipmentsCard from "../../components/order/ShipmentsCard";
import ProductRow from "../../components/order/ProductRow";
import { OrderItem } from "../../types/Order";
import { formatPrice } from "../../utils/price";

const SummaryPage: React.FC = () => {
  const { order, fetchOrder, resetCart } = useOrder();
  const navigate = useNavigate();
  const [extraNotes, setExtraNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const attachCustomerToOrder = async (
      orderToken: string,
      jwtToken: string,
      orderData: any
  ) => {
    const apiUrl = window.ENV?.API_URL ?? "";

    // Budujemy payload z adresami
    const payload: any = {
      billingAddress: orderData.billingAddress,
      shippingAddress: orderData.shippingAddress,
    };

    // Dodajemy email tylko gdy order.customer jest null (czyli gość)
    if (!orderData.customer) {
      payload.email = orderData.email ?? "";
    }

    const response = await fetch(`${apiUrl}/api/v2/shop/orders/${orderToken}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to attach customer: ${text}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!order?.tokenValue) {
      console.warn("❌ Missing order token");
      setIsSubmitting(false);
      return;
    }

    try {
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        throw new Error("User not logged in");
      }

      if (
          order.billingAddress &&
          order.shippingAddress &&
          order.items &&
          order.items.length > 0
      ) {
        await attachCustomerToOrder(order.tokenValue, jwtToken, order);
        await fetchOrder(); // odśwież po przypięciu klienta, by mieć aktualny order.customer
      }

      const response = await fetch(
          `${window.ENV?.API_URL}/api/v2/shop/orders/${order.tokenValue}/complete`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/merge-patch+json" },
            body: JSON.stringify({ notes: extraNotes }),
          }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("❌ Failed to complete order");
        console.error("🧾 Response status:", response.status);
        console.error("🧾 Response text:", text);
        throw new Error("Failed to complete order");
      }

      resetCart();
      navigate("/order/thank-you", { state: { tokenValue: order.tokenValue } });
    } catch (error) {
      console.error("🚨 Error submitting order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <CheckoutLayout sidebarOn={false}>
        <div className="col pt-4 pb-5">
          <div className="mx-auto">
            <Steps activeStep="complete" />
            <h1 className="h5 mb-4">Order #{order?.number}</h1>

            {order && (
                <div className="card border-0 bg-body-tertiary mb-3">
                  <div className="card-body d-flex flex-column gap-1">
                    <div className="row">
                      <div className="col-12 col-sm-4">Currency</div>
                      <div className="col">{order.currencyCode}</div>
                    </div>
                    <div className="row">
                      <div className="col-12 col-sm-4">Locale</div>
                      <div className="col">{order.localeCode}</div>
                    </div>
                  </div>
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="row">
                <div className="col-12 col-md-6 mb-3">
                  {order?.billingAddress && (
                      <Address sectionName="Billing address" address={order.billingAddress} />
                  )}
                </div>
                <div className="col-12 col-md-6 mb-3">
                  {order?.shippingAddress && (
                      <Address sectionName="Shipping address" address={order.shippingAddress} />
                  )}
                </div>
              </div>

              <div className="mb-5">
                {order?.payments && (
                    <PaymentsCard
                        payment={order?.payments[0]}
                        total={order?.total ?? 0}
                        paymentState={order?.paymentState}
                    />
                )}
                {order?.shipments && <ShipmentsCard shipment={order?.shipments[0]} />}
              </div>

              <div className="table-responsive border-bottom mb-4">
                <table className="table table-borderless table-space align-middle mb-0">
                  <thead>
                  <tr>
                    <th>Item</th>
                    <th className="text-end">Unit price</th>
                    <th className="text-end">Qty</th>
                    <th className="text-end">Subtotal</th>
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
                  <td className="text-end w-75">Items total:</td>
                  <td className="text-end">${formatPrice(order?.itemsSubtotal ?? 0)}</td>
                </tr>
                <tr>
                  <td className="text-end w-75">Taxes total:</td>
                  <td className="text-end">
                    <div>${formatPrice(order?.taxTotal ?? 0)}</div>
                    <small className="text-body-tertiary">Included in price</small>
                  </td>
                </tr>
                <tr>
                  <td className="text-end w-75">Discount:</td>
                  <td className="text-end">${formatPrice(order?.orderPromotionTotal ?? 0)}</td>
                </tr>
                <tr>
                  <td className="text-end w-75">Shipping total:</td>
                  <td className="text-end">${formatPrice(order?.shippingTotal ?? 0)}</td>
                </tr>
                <tr>
                  <td className="h5 text-end border-top pt-4 mt-3">Total:</td>
                  <td className="h5 text-end border-top pt-4 mt-3">
                    ${formatPrice(order?.total ?? 0)}
                  </td>
                </tr>
                </tbody>
              </table>

              <div className="field mb-3">
                <label htmlFor="sylius_checkout_complete_notes" className="form-label">
                  Extra notes
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
                  Place order
                </button>
              </div>
            </form>
          </div>
        </div>
      </CheckoutLayout>
  );
};

export default SummaryPage;
