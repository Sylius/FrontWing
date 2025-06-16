import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useNavigation } from "@remix-run/react";
import Default from "~/layouts/Default";
import { IconCreditCard } from "@tabler/icons-react";
import Skeleton from "react-loading-skeleton";
import type { Order } from "~/types/Order"; // 🟢 używamy Twojego globalnego typu

interface PaymentMethod {
    id: number;
    code: string;
    name: string;
    description?: string;
}

interface LoaderData {
    order: Order;
    paymentMethods: PaymentMethod[];
    token: string;
}

const API_URL =
    typeof window !== "undefined"
        ? window.ENV?.API_URL
        : process.env.PUBLIC_API_URL;

if (!API_URL) {
    throw new Error("API_URL not defined in window.ENV or process.env.PUBLIC_API_URL");
}

export const loader: LoaderFunction = async ({ params }) => {
    const token = params.token;
    if (!token) {
        throw new Response("Missing order token", { status: 400 });
    }

    const headers: Record<string, string> = {};

    const orderRes = await fetch(`${API_URL}/api/v2/shop/orders/${token}`, { headers });
    if (!orderRes.ok) throw new Response("Failed to load order", { status: 500 });
    const order: Order = await orderRes.json();

    let list: PaymentMethod[] = [];
    const payment = order.payments?.[0];
    if (payment?.id) {
        const methodsRes = await fetch(
            `${API_URL}/api/v2/shop/orders/${token}/payments/${payment.id}/methods`,
            { headers }
        );
        if (methodsRes.ok) {
            const data = await methodsRes.json();
            list = data["hydra:member"] || [];
        }
    }

    if (list.length === 0) {
        const fallbackRes = await fetch(`${API_URL}/api/v2/shop/payment-methods`, { headers });
        if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            list = fallbackData["hydra:member"] || [];
        }
    }

    return json<LoaderData>({ order, paymentMethods: list, token });
};

export const action: ActionFunction = async ({ request, params }) => {
    const token = params.token;
    if (!token) throw new Response("Missing order token", { status: 400 });

    const form = await request.formData();
    const method = form.get("paymentMethod");
    if (typeof method !== "string") {
        throw new Response("Invalid form submission", { status: 400 });
    }

    const headers: Record<string, string> = {
        "Content-Type": "application/merge-patch+json",
    };

    const orderRes = await fetch(`${API_URL}/api/v2/shop/orders/${token}`, { headers });
    if (!orderRes.ok) throw new Response("Failed to load order for patch", { status: 500 });
    const order: Order = await orderRes.json();
    const paymentId = order.payments?.[0]?.id;
    if (!paymentId) throw new Response("No payment found", { status: 400 });

    const res = await fetch(
        `${API_URL}/api/v2/shop/orders/${token}/payments/${paymentId}`,
        {
            method: "PATCH",
            headers,
            body: JSON.stringify({ paymentMethod: method }),
        }
    );

    if (!res.ok) {
        const text = await res.text();
        let data: any = {};
        try {
            data = JSON.parse(text);
        } catch {}
        const msg = data.message || "Failed to set payment method";
        return json({ formError: msg }, { status: 400 });
    }

    return redirect(`/order/thank-you?token=${token}`);
};

export default function PayOrderPage() {
    const { order, paymentMethods } = useLoaderData<LoaderData>();
    const navigation = useNavigation();
    const busy = navigation.state !== "idle";

    const total = (order.total ?? 0) / 100;
    const itemCount = order.items?.length ?? 0;

    return (
        <Default>
            <div className="container my-5">
                <div className="col-lg-8 mx-auto">
                    <h1 className="h4 mb-2">
                        {order.number ? `Summary of your order #${order.number}` : <Skeleton width={300} />}
                    </h1>
                    <p className="text-muted mb-4">
                        {total.toFixed(2)} {order.currencyCode} • {itemCount} {itemCount === 1 ? "item" : "items"}
                        {order.checkoutCompletedAt && (
                            <>
                                {" "}
                                •{" "}
                                {new Date(order.checkoutCompletedAt).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </>
                        )}
                    </p>

                    <Form method="post">
                        <h5 className="mb-4">Payment #1</h5>

                        {paymentMethods.length === 0 ? (
                            <div className="alert alert-warning">No payment methods available.</div>
                        ) : (
                            paymentMethods.map((m) => (
                                <div key={m.id} className="card mb-3">
                                    <label className="card-body">
                                        <div className="form-check">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={m.code}
                                                className="form-check-input"
                                                defaultChecked={paymentMethods[0].code === m.code}
                                            />
                                            <label className="form-check-label">{m.name}</label>
                                        </div>
                                        {m.description && (
                                            <small className="text-muted ps-4">{m.description}</small>
                                        )}
                                    </label>
                                </div>
                            ))
                        )}

                        <div className="text-center mt-4">
                            <button type="submit" className="btn btn-primary w-100" disabled={busy}>
                                <IconCreditCard size={20} className="me-2" /> Pay
                            </button>
                        </div>
                    </Form>
                </div>
            </div>
        </Default>
    );
}
