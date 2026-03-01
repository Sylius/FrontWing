import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Default from "../../layouts/Default";
import AccountLayout from "../../layouts/Account";
import Address from "../../components/Address";
import PaymentsCard from "../../components/order/PaymentsCard";
import ShipmentsCard from "../../components/order/ShipmentsCard";
import ProductRow from "../../components/order/ProductRow";
import { OrderItem, Order } from "../../types/Order";
import { formatPrice } from "../../utils/price";
import Skeleton from "react-loading-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const OrderDetailsPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const tokenJwt = localStorage.getItem("jwtToken");
        if (!tokenJwt || !token) return;

        const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;
        const orderRes = await fetch(`${baseUrl}/api/v2/shop/orders/${token}`, {
          headers: { Authorization: `Bearer ${tokenJwt}` },
        });

        if (!orderRes.ok) throw new Error("Blad pobierania zamowienia");
        const data = await orderRes.json();

        if (data.payments?.[0]?.["@id"]) {
          const paymentRes = await fetch(`${baseUrl}${data.payments[0]["@id"]}`, {
            headers: { Authorization: `Bearer ${tokenJwt}` },
          });

          if (paymentRes.ok) {
            const fullPayment = await paymentRes.json();
            data.payments[0] = fullPayment;
            data.createdAt = fullPayment.createdAt;
          }
        }

        setOrder(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [token]);

  return (
    <Default>
      <AccountLayout
        breadcrumbs={
          order
            ? [
                { label: "Home", url: "/" },
                { label: "My account", url: "/account/dashboard" },
                { label: "Order History", url: "/account/order-history" },
                { label: `#${order.number}`, url: `/account/orders/${order.tokenValue}` },
              ]
            : []
        }
      >
        {loading ? (
          <div className="w-full pt-4 md:w-3/4">
            <Skeleton height={30} width={200} className="mb-4" />
            <Skeleton height={100} className="mb-3" count={2} />
            <Skeleton height={200} className="mb-4" />
          </div>
        ) : (
          <div className="w-full pt-4 md:w-3/4">
            <h1 className="mb-4 text-lg font-semibold">Order #{order?.number}</h1>

            <div className="bg-muted mb-3 rounded-lg">
              <div className="flex flex-col gap-1 p-4">
                <div className="-mx-4 flex flex-wrap">
                  <div className="w-full px-4 sm:w-1/3">State</div>
                  <div className="flex-1 px-4">{order?.state || "-"}</div>
                </div>
                <div className="-mx-4 flex flex-wrap">
                  <div className="w-full px-4 sm:w-1/3">Created at</div>
                  <div className="flex-1 px-4">
                    {order?.createdAt
                      ? new Date(order.createdAt).toLocaleString("en-GB", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </div>
                </div>
                <div className="-mx-4 flex flex-wrap">
                  <div className="w-full px-4 sm:w-1/3">Currency</div>
                  <div className="flex-1 px-4">{order?.currencyCode || "-"}</div>
                </div>
              </div>
            </div>

            <div className="mb-4">
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
            </div>

            {order?.payments?.[0] && (
              <PaymentsCard
                payment={order.payments[0]}
                total={order.total ?? 0}
                paymentState={order.paymentState}
              />
            )}

            <div className="bg-muted mb-3 rounded-lg">
              <div className="flex items-center p-4">
                <div className="flex-1">Shipments</div>
                <div>{order?.state}</div>
              </div>
            </div>

            {order?.shipments?.[0] && <ShipmentsCard shipment={order.shipments[0]} />}

            <div className="mt-4">
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
                    <ProductRow key={item.id} orderItem={item} />
                  ))}
                </TableBody>
              </Table>
            </div>

            <Table className="mt-4 ml-auto w-auto">
              <TableBody>
                <TableRow>
                  <TableCell className="py-1 pr-4 text-right">Items total:</TableCell>
                  <TableCell className="py-1 text-right">
                    ${formatPrice(order?.itemsSubtotal)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-1 pr-4 text-right">Tax total:</TableCell>
                  <TableCell className="py-1 text-right">${formatPrice(order?.taxTotal)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-1 pr-4 text-right">Discount:</TableCell>
                  <TableCell className="py-1 text-right">
                    ${formatPrice(order?.orderPromotionTotal)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-1 pr-4 text-right">Shipping total:</TableCell>
                  <TableCell className="py-1 text-right">
                    ${formatPrice(order?.shippingTotal)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="py-1 pr-4 text-right font-bold">Total:</TableCell>
                  <TableCell className="py-1 text-right font-bold">
                    ${formatPrice(order?.total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </AccountLayout>
    </Default>
  );
};

export default OrderDetailsPage;
