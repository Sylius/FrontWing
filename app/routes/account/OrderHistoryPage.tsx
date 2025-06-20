import React from 'react';
import { Link } from '@remix-run/react';
import Default from '~/layouts/Default';
import AccountLayout from '~/layouts/Account';
import { useCustomer } from '~/context/CustomerContext';
import { useQuery } from '@tanstack/react-query';
import { Order } from '~/types/Order';
import Skeleton from 'react-loading-skeleton';
import { IconCreditCard } from '@tabler/icons-react';

const fetchCustomerOrders = async (): Promise<Order[]> => {
    const token = localStorage.getItem('jwtToken');
    if (!token) throw new Error('No Token');

    if (!window.ENV?.API_URL) throw new Error("API_URL is not defined");
    const baseUrl = window.ENV.API_URL;
    const response = await fetch(`${baseUrl}/api/v2/shop/orders`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Order download error');

    const data = await response.json();
    const basicOrders = data['hydra:member'] as Partial<Order>[];

    const fullOrders = await Promise.all(
        basicOrders.map(async (order) => {
            try {
                const orderRes = await fetch(
                    `${baseUrl}/api/v2/shop/orders/${order.tokenValue}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (!orderRes.ok) throw new Error('Full order download error');
                const fullOrder = await orderRes.json();
                return fullOrder as Order;
            } catch {
                return order as Order;
            }
        })
    );

    return fullOrders;
};

export default function OrderHistoryPage() {
    const { customer } = useCustomer();
    const { data: orders = [], isLoading, isError } = useQuery<Order[]>({
        queryKey: ['customerOrders', customer?.email],
        queryFn: fetchCustomerOrders,
        enabled: !!customer,
    });

    return (
        <Default>
            <AccountLayout
                breadcrumbs={[
                    { label: 'Home', url: '/' },
                    { label: 'My account', url: '/account/dashboard' },
                    { label: 'Order History', url: '/account/order-history' },
                ]}
            >
                <div className="col-12 col-md-9">
                    <div className="mb-4">
                        <h1>Order history</h1>
                        Browse your past orders
                    </div>

                    <div className="card">
                        <div className="card-body border-bottom py-3">
                            <div className="table-responsive">
                                {isLoading ? (
                                    <table className="table card-table">
                                        <tbody>
                                        <tr>
                                            <td><Skeleton width={80} /></td>
                                            <td><Skeleton width={100} /></td>
                                            <td><Skeleton width={100} /></td>
                                            <td><Skeleton width={80} /></td>
                                            <td><Skeleton width={80} /></td>
                                            <td><Skeleton width={60} height={30} /></td>
                                        </tr>
                                        </tbody>
                                    </table>
                                ) : isError ? (
                                    <p>Failed to load orders. Please try again later.</p>
                                ) : (
                                    <table className="table card-table table-vcenter text-nowrap datatable">
                                        <thead>
                                        <tr>
                                            <th>Number</th>
                                            <th>Date</th>
                                            <th>Ship to</th>
                                            <th>Total</th>
                                            <th>State</th>
                                            <th className="text-center">Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {orders.map((order) => (
                                            <tr key={order.tokenValue}>
                                                <td>#{order.number}</td>
                                                <td>
                                                    {order.checkoutCompletedAt
                                                        ? new Date(order.checkoutCompletedAt).toLocaleDateString('en-GB')
                                                        : '-'}
                                                </td>
                                                <td>
                                                    {order.shippingAddress
                                                        ? `${order.shippingAddress.firstName ?? ''} ${order.shippingAddress.lastName ?? ''}`.trim()
                                                        : '-'}
                                                </td>
                                                <td>${(order.itemsSubtotal / 100).toFixed(2)}</td>
                                                <td>{order.state}</td>
                                                <td className="d-flex gap-2 flex-wrap justify-content-center">
                                                    <Link
                                                        to={`/account/orders/${order.tokenValue}`}
                                                        className="btn btn-sm btn-outline-gray"
                                                    >
                                                        Show
                                                    </Link>
                                                    {order.state !== 'completed' && order.paymentState === 'awaiting_payment' && (
                                                        <Link
                                                            to={`/account/orders/${order.tokenValue}/pay`}
                                                            className="btn btn-sm btn-outline-gray d-flex align-items-center gap-1"
                                                        >
                                                            <IconCreditCard size={18} />
                                                            Pay
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </AccountLayout>
        </Default>
    );
}
