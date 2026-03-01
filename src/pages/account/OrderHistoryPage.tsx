import React from "react";
import { Link } from "react-router-dom";
import Default from "../../layouts/Default";
import AccountLayout from "../../layouts/Account";
import { useCustomer } from "../../context/CustomerContext";
import { useQuery } from "@tanstack/react-query";
import { Order } from "../../types/Order";
import Skeleton from "react-loading-skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const fetchCustomerOrders = async (): Promise<Order[]> => {
    const token = localStorage.getItem("jwtToken");
    if (!token) throw new Error("No Token");

    const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;

    const response = await fetch(`${baseUrl}/api/v2/shop/orders`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        throw new Error("Order download error");
    }

    const data = await response.json();
    const basicOrders = data["hydra:member"] as Partial<Order>[];

    const fullOrders = await Promise.all(
        basicOrders.map(async (order) => {
            try {
                const orderResponse = await fetch(`${baseUrl}/api/v2/shop/orders/${order.tokenValue}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!orderResponse.ok) {
                    throw new Error("Full order download error");
                }

                const fullOrderData = await orderResponse.json();

                let createdAt: string | undefined = undefined;

                if (fullOrderData.payments && fullOrderData.payments.length > 0) {
                    const paymentUrl = fullOrderData.payments[0]["@id"];
                    const paymentResponse = await fetch(`${baseUrl}${paymentUrl}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (paymentResponse.ok) {
                        const paymentData = await paymentResponse.json();
                        createdAt = paymentData.createdAt;
                    }
                }

                return {
                    ...fullOrderData,
                    createdAt: createdAt ?? undefined,
                };
            } catch (error) {
                console.warn(`Failed to fetch full order for token: ${order.tokenValue}`, error);
                return order as Order;
            }
        })
    );

    return fullOrders;
};

const OrderHistoryPage: React.FC = () => {
    const { customer } = useCustomer();

    const { data: orders = [], isLoading, isError } = useQuery<Order[]>({
        queryKey: ["customerOrders", customer?.email],
        queryFn: fetchCustomerOrders,
        enabled: !!customer,
    });

    return (
        <Default>
            <AccountLayout
                breadcrumbs={[
                    { label: "Home", url: "/" },
                    { label: "My account", url: "/account/dashboard" },
                    { label: "Order History", url: "/account/order-history" },
                ]}
            >
                <div className="w-full md:w-3/4">
                    <div className="mb-4">
                        <h1>Order history</h1>
                        Browse your orders from the past
                    </div>

                    <div className="border rounded-lg">
                        <div className="p-4 border-b">
                            <div className="border-b pb-3"></div>
                            <div className="overflow-x-auto">
                                {isLoading ? (
                                    <Table>
                                        <TableBody>
                                        <TableRow>
                                            <TableCell><Skeleton width={80} /></TableCell>
                                            <TableCell><Skeleton width={100} /></TableCell>
                                            <TableCell><Skeleton width={100} /></TableCell>
                                            <TableCell><Skeleton width={80} /></TableCell>
                                            <TableCell><Skeleton width={80} /></TableCell>
                                            <TableCell><Skeleton width={60} height={30} /></TableCell>
                                        </TableRow>
                                        </TableBody>
                                    </Table>
                                ) : isError ? (
                                    <p>Failed to load orders. Please try again later.</p>
                                ) : (
                                    <Table className="whitespace-nowrap">
                                        <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-left pr-4">Number</TableHead>
                                            <TableHead className="text-left pr-4">Date</TableHead>
                                            <TableHead className="text-left pr-4">Ship to</TableHead>
                                            <TableHead className="text-left pr-4">Total</TableHead>
                                            <TableHead className="text-left pr-4">State</TableHead>
                                            <TableHead className="text-left">Actions</TableHead>
                                        </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                        {orders.map((order: Order) => (
                                            <TableRow key={order.tokenValue}>
                                                <TableCell className="pr-4">#{order.number}</TableCell>
                                                <TableCell className="pr-4">
                                                    {order.createdAt
                                                        ? new Date(order.createdAt).toLocaleDateString('en-GB', {
                                                            year: 'numeric',
                                                            month: '2-digit',
                                                            day: '2-digit',
                                                        })
                                                        : '-'}
                                                </TableCell>
                                                <TableCell className="pr-4">
                                                    {order.shippingAddress
                                                        ? `${order.shippingAddress.firstName ?? ''} ${order.shippingAddress.lastName ?? ''}`.trim()
                                                        : '-'}
                                                </TableCell>
                                                <TableCell className="pr-4">${(order.itemsSubtotal / 100).toFixed(2)}</TableCell>
                                                <TableCell className="pr-4">{order.state}</TableCell>
                                                <TableCell>
                                                    <Link
                                                        to={`/account/orders/${order.tokenValue}`}
                                                        className="inline-flex items-center px-3 py-1.5 text-sm border border-border rounded hover:bg-muted"
                                                    >
                                                        Show
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </AccountLayout>
        </Default>
    );
};

export default OrderHistoryPage;
