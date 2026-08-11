export const handle = { i18n: ["common","cart","account"] };

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { useLocalizedNavigate } from "~/hooks/useLocalizedNavigate";
import Default from "~/layouts/Default";
import AccountLayout from "~/layouts/Account";
import Address from "~/components/Address";
import PaymentsCard from "~/components/order/PaymentsCard";
import ProductRow from "~/components/order/ProductRow";
import { OrderItem, Order } from "~/types/Order";
import { useCurrency } from "~/context/ChannelContext";
import Skeleton from "react-loading-skeleton";
import { IconCreditCard } from "@tabler/icons-react";

export default function OrderDetailsPage() {
    const { t } = useTranslation(["account", "common"]);
    const { formatPrice } = useCurrency();
    const { token } = useParams<{ token: string }>();
    const navigate = useLocalizedNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        async function fetchOrder() {
            setErrorMessage("");
            try {
                const jwt = localStorage.getItem("jwtToken");
                if (!jwt || !token) {
                    setErrorMessage(t("orders.details.missingCredentials"));
                    return;
                }

                if (!window.ENV?.API_URL) throw new Error("API_URL is not defined");
                const baseUrl = window.ENV.API_URL;
                const res = await fetch(`${baseUrl}/api/v2/shop/orders/${token}`, {
                    headers: { Authorization: `Bearer ${jwt}` },
                });
                if (!res.ok) {
                    throw new Error(t("orders.details.loadFailed"));
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

                const shipmentPromises = (data.shipments ?? []).map(async (shipment) => {
                    const res = await fetch(`${baseUrl}${shipment["@id"]}`, {
                        headers: { Authorization: `Bearer ${jwt}` },
                    });
                    return res.ok ? await res.json() : shipment;
                });
                data.shipments = await Promise.all(shipmentPromises);

                const methodPromises = (data.shipments ?? []).map(async (shipment) => {
                    const res = await fetch(`${baseUrl}${shipment.method}`, {
                        headers: { Authorization: `Bearer ${jwt}` },
                    });
                    shipment.method = res.ok ? await res.json() : shipment.method;
                    return shipment;
                });
                data.shipments = await Promise.all(methodPromises);

                setOrder(data);
            } catch (e) {
                console.error(e);
                setErrorMessage(
                    e instanceof Error
                        ? e.message
                        : t("orders.details.unexpectedError")
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
                    { label: t("common:nav.home"), url: "/" },
                    { label: t("common:nav.account"), url: "/account/dashboard" },
                    { label: t("orders.breadcrumb"), url: "/account/order-history" },
                    { label: `#${order.number}`, url: `/account/orders/${order.tokenValue}` },
                ]}
            >
                <div className="col-12 col-md-9 pt-4">
                    <h1 className="h5 mb-4">{t("orders.details.title", { number: order.number })}</h1>

                    {order.paymentState === "awaiting_payment" && (
                        <div className="d-flex justify-content-end align-items-center mb-3">
                            <button
                                className="btn btn-primary btn-icon"
                                onClick={() => navigate(`/account/orders/${order.tokenValue}/pay`)}
                            >
                                <IconCreditCard size={20} className="me-2" />
                                {t("orders.details.pay")}
                            </button>
                        </div>
                    )}

                    <div className="card border-0 bg-body-tertiary mb-3">
                        <div className="card-body d-flex flex-column gap-1">
                            <div className="row">
                                <div className="col-12 col-sm-4">{t("orders.details.status")}</div>
                                <div className="col">{order.state}</div>
                            </div>
                            <div className="row">
                                <div className="col-12 col-sm-4">{t("orders.details.completedAt")}</div>
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
                                <div className="col-12 col-sm-4">{t("orders.details.currency")}</div>
                                <div className="col">{order.currencyCode}</div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                {order.billingAddress && (
                                    <Address sectionName={t("orders.details.billingAddress")} address={order.billingAddress} />
                                )}
                            </div>
                            <div className="col-md-6 mb-3">
                                {order.shippingAddress && (
                                    <Address sectionName={t("orders.details.shippingAddress")} address={order.shippingAddress} />
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
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <div>{t("orders.details.shipments")}</div>
                            <div>
                                {order.shippingState}
                            </div>
                        </div>
                        <div className="card-body d-flex flex-column gap-2">
                            {order.shipments?.map((shipment) => (
                                <div key={shipment.id} className="d-flex justify-content-between">
                                    <div>
                                        {typeof shipment.method === "object"
                                            ? shipment.method.name ?? shipment.method.code
                                            : shipment.method}
                                    </div>
                                    {shipment.state && (
                                        <div>
                                            {shipment.state}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="table-responsive mt-4">
                        <table className="table table-borderless align-middle">
                            <thead>
                            <tr>
                                <th>{t("orders.items.item")}</th>
                                <th className="text-end">{t("orders.items.unitPrice")}</th>
                                <th className="text-end">{t("orders.items.qty")}</th>
                                <th className="text-end">{t("orders.items.subtotal")}</th>
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
                            <td className="text-end">{t("orders.items.itemsTotal")}</td>
                            <td className="text-end">{formatPrice(order.itemsSubtotal ?? 0)}</td>
                        </tr>
                        <tr>
                            <td className="text-end">{t("orders.items.taxTotal")}</td>
                            <td className="text-end">{formatPrice(order.taxTotal ?? 0)}</td>
                        </tr>
                        <tr>
                            <td className="text-end">{t("orders.items.discount")}</td>
                            <td className="text-end">{formatPrice(order.orderPromotionTotal ?? 0)}</td>
                        </tr>
                        <tr>
                            <td className="text-end">{t("orders.items.shippingTotal")}</td>
                            <td className="text-end">{formatPrice(order.shippingTotal ?? 0)}</td>
                        </tr>
                        <tr>
                            <td className="text-end fw-bold">{t("orders.items.total")}</td>
                            <td className="text-end fw-bold">{formatPrice(order.total ?? 0)}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </AccountLayout>
        </Default>
    );
}
