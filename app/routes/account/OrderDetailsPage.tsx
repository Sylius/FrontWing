import { useEffect, useState } from "react";
import { useParams, useNavigate } from "@remix-run/react";
import Default from "~/layouts/Default";
import AccountLayout from "~/layouts/Account";
import Address from "~/components/Address";
import PaymentsCard from "~/components/order/PaymentsCard";
import ShipmentsCard from "~/components/order/ShipmentsCard";
import ProductRow from "~/components/order/ProductRow";
import { OrderItem, Order } from "~/types/Order";
import { formatPrice } from "~/utils/price";
import Skeleton from "react-loading-skeleton";
import { IconCreditCard } from "@tabler/icons-react";

export default function OrderDetailsPage() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        async function fetchOrder() {
            setErrorMessage("");
            try {
                const jwt = localStorage.getItem("jwtToken");
                if (!jwt || !token) {
                    setErrorMessage("Missing credentials or order token.");
                    return;
                }

                if (!window.ENV?.API_URL) throw new Error("API_URL is not defined");
                const baseUrl = window.ENV.API_URL;
                const res = await fetch(`${baseUrl}/api/v2/shop/orders/${token}`, {
                    headers: { Authorization: `Bearer ${jwt}` },
                });
                if (!res.ok) {
                    throw new Error("Failed to fetch order details.");
                }
                const data: Order = await res.json();

                const paymentRef = data.payments?.[0]?.["@id"];
                if (paymentRef) {
                    const payRes = await fetch(`${baseUrl}${paymentRef}`, {
                        headers: { Authorization: `Bearer ${jwt}` },
                    });
                    if (payRes.ok) {
                        const full = await payRes.json();
                        data.payments![0] = full;
                        data.createdAt = full.createdAt;
                    }
                }

                setOrder(data);
            } catch (e) {
                console.error(e);
                setErrorMessage(
                    e instanceof Error
                        ? e.message
                        : "An unexpected error occurred while loading the order."
                );
            } finally {
                setLoading(false);
            }
        }
        fetchOrder();
    }, [token]);

    if (loading) {
        return (
            <Default>
                <AccountLayout breadcrumbs={[]}>
                    <div className="col-12 col-md-9 pt-4">
                        <Skeleton height={30} width={200} className="mb-4" />
                        <Skeleton height={100} className="mb-3" count={2} />
                        <Skeleton height={200} className="mb-4" />
                    </div>
                </AccountLayout>
            </Default>
        );
    }

    if (errorMessage) {
        return (
            <Default>
                <AccountLayout breadcrumbs={[]}>
                    <div className="col-12 col-md-9 pt-4">
                        <div className="alert alert-danger">{errorMessage}</div>
                    </div>
                </AccountLayout>
            </Default>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <Default>
            <AccountLayout
                breadcrumbs={[
                    { label: "Home", url: "/" },
                    { label: "My account", url: "/account/dashboard" },
                    { label: "Order History", url: "/account/order-history" },
                    { label: `#${order.number}`, url: `/account/orders/${order.tokenValue}` },
                ]}
            >
                <div className="col-12 col-md-9 pt-4">
                    <h1 className="h5 mb-4">Order #{order.number}</h1>

                    {order.paymentState === "awaiting_payment" && (
                        <div className="d-flex justify-content-end align-items-center mb-3">
                            <button
                                className="btn btn-primary btn-icon"
                                onClick={() => navigate(`/account/orders/${order.tokenValue}/pay`)}
                            >
                                <IconCreditCard size={20} className="me-2" />
                                Pay
                            </button>
                        </div>
                    )}

                    <div className="card border-0 bg-body-tertiary mb-3">
                        <div className="card-body d-flex flex-column gap-1">
                            <div className="row">
                                <div className="col-12 col-sm-4">Status</div>
                                <div className="col">{order.state}</div>
                            </div>
                            <div className="row">
                                <div className="col-12 col-sm-4">Completed at</div>
                                <div className="col">
                                    {order.checkoutCompletedAt
                                        ? new Date(order.checkoutCompletedAt).toLocaleString("en-GB", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
                                        : "-"}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12 col-sm-4">Currency</div>
                                <div className="col">{order.currencyCode}</div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                {order.billingAddress && (
                                    <Address sectionName="Billing address" address={order.billingAddress} />
                                )}
                            </div>
                            <div className="col-md-6 mb-3">
                                {order.shippingAddress && (
                                    <Address sectionName="Shipping address" address={order.shippingAddress} />
                                )}
                            </div>
                        </div>
                    </div>

                    {order.payments?.[0] && (
                        <PaymentsCard
                            payment={order.payments[0]}
                            total={order.total ?? 0}
                            paymentState={order.paymentState}
                        />
                    )}

                    <div className="card border-0 bg-body-tertiary mb-3">
                        <div className="card-header d-flex align-items-center">
                            <div className="me-auto">Shipments</div>
                            <div>{order.state}</div>
                        </div>
                    </div>

                    {order.shipments?.[0] && <ShipmentsCard shipment={order.shipments[0]} />}

                    <div className="table-responsive mt-4">
                        <table className="table table-borderless align-middle">
                            <thead>
                            <tr>
                                <th>Item</th>
                                <th className="text-end">Unit price</th>
                                <th className="text-end">Qty</th>
                                <th className="text-end">Subtotal</th>
                            </tr>
                            </thead>
                            <tbody>
                            {(order.items ?? []).map((item: OrderItem) => (
                                <ProductRow key={item.id} orderItem={item} />
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <table className="table table-borderless align-middle ms-auto w-auto">
                        <tbody>
                        <tr>
                            <td className="text-end">Items total:</td>
                            <td className="text-end">${formatPrice(order.itemsSubtotal ?? 0)}</td>
                        </tr>
                        <tr>
                            <td className="text-end">Tax total:</td>
                            <td className="text-end">${formatPrice(order.taxTotal ?? 0)}</td>
                        </tr>
                        <tr>
                            <td className="text-end">Discount:</td>
                            <td className="text-end">${formatPrice(order.orderPromotionTotal ?? 0)}</td>
                        </tr>
                        <tr>
                            <td className="text-end">Shipping total:</td>
                            <td className="text-end">${formatPrice(order.shippingTotal ?? 0)}</td>
                        </tr>
                        <tr>
                            <td className="text-end fw-bold">Total:</td>
                            <td className="text-end fw-bold">${formatPrice(order.total ?? 0)}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </AccountLayout>
        </Default>
    );
}
