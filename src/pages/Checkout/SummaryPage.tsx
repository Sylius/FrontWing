import React, { useEffect, useState } from "react";
import CheckoutLayout from "../../layouts/Checkout";
import { useOrder } from "../../context/OrderContext";
import Address from "../../components/Address";
import PaymentsCard from "../../components/order/PaymentsCard";
import ShipmentsCard from "../../components/order/ShipmentsCard";
import ProductRow from "../../components/order/ProductRow";
import { OrderItem } from "../../types/Order";
import { formatPrice } from "../../utils/price";
import { useNavigate } from "react-router-dom";
import Steps from "../../components/checkout/Steps";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SummaryPage: React.FC = () => {
  const { order, fetchOrder, setOrderToken } = useOrder();

  const navigate = useNavigate();

  const [extraNotes, setExtraNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const orderToken = localStorage.getItem("orderToken");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/orders/${orderToken}/complete`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/merge-patch+json" },
          body: JSON.stringify({ notes: extraNotes }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit order");
      }

      setOrderToken(null);
      localStorage.removeItem("orderToken");
      navigate("/order/thank-you", {
        state: { tokenValue: order?.tokenValue },
      });
    } catch (error) {
      console.error("Error submitting order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return (
    <CheckoutLayout sidebarOn={false}>
      <div className="flex-1 pt-4 pb-5">
        <div className="mx-auto">
          <Steps activeStep="complete" />
          <h1 className="mb-4 text-lg font-semibold">Order #{order?.number}</h1>

          {order && (
            <div className="bg-muted mb-3 rounded-lg">
              <div className="flex flex-col gap-1 p-4">
                <div className="-mx-4 flex flex-wrap">
                  <div className="w-full px-4 sm:w-1/3">Currency</div>
                  <div className="flex-1 px-4">{order.currencyCode}</div>
                </div>
                <div className="-mx-4 flex flex-wrap">
                  <div className="w-full px-4 sm:w-1/3">Locale</div>
                  <div className="flex-1 px-4">{order.localeCode}</div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="-mx-4 flex flex-wrap">
              <div className="mb-3 w-full px-4 md:w-1/2">
                {order?.billingAddress && (
                  <Address sectionName="Billing address" address={order.billingAddress} />
                )}
              </div>
              <div className="mb-3 w-full px-4 md:w-1/2">
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

            <div className="mb-4 border-b">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Item</TableHead>
                    <TableHead className="text-right">Unit price</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order?.items?.map((item: OrderItem) => (
                    <ProductRow orderItem={item} key={item.id} />
                  ))}
                </TableBody>
              </Table>
            </div>

            <Table className="mb-6 ml-auto">
              <TableBody>
                <TableRow>
                  <TableCell className="w-3/4 py-1 pr-4 text-right">Items total:</TableCell>
                  <TableCell className="py-1 text-right">
                    ${formatPrice(order?.itemsSubtotal ?? 0)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-1 pr-4 text-right">Taxes total:</TableCell>
                  <TableCell className="py-1 text-right">
                    <div>${formatPrice(order?.taxTotal ?? 0)}</div>
                    <small className="text-muted-foreground">Included in price</small>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-1 pr-4 text-right">Discount:</TableCell>
                  <TableCell className="py-1 text-right">
                    ${formatPrice(order?.orderPromotionTotal ?? 0)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-1 pr-4 text-right">Shipping total:</TableCell>
                  <TableCell className="py-1 text-right">
                    ${formatPrice(order?.shippingTotal ?? 0)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border-t pt-4 pr-4 text-right text-lg font-semibold">
                    Total:
                  </TableCell>
                  <TableCell className="border-t pt-4 text-right text-lg font-semibold">
                    ${formatPrice(order?.total ?? 0)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="mb-3">
              <label
                htmlFor="sylius_checkout_complete_notes"
                className="mb-1 block text-sm font-medium"
              >
                Extra notes
              </label>
              <Textarea
                id="sylius_checkout_complete_notes"
                value={extraNotes}
                onChange={(e) => setExtraNotes(e.target.value)}
              />
            </div>

            <div className="text-center">
              <Button type="submit" disabled={isSubmitting}>
                Place order
              </Button>
            </div>
          </form>
        </div>
      </div>
    </CheckoutLayout>
  );
};

export default SummaryPage;
