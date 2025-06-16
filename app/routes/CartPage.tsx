// ~/routes/CartPage.tsx

import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "@remix-run/node";
import {
  useLoaderData,
  useFetcher,
  useLocation,
  Link,
} from "@remix-run/react";
import Layout from "~/layouts/Default";
import { orderTokenCookie } from "~/utils/cookies.server";
import {
  pickupCart,
  fetchOrderFromAPI,
  updateOrderItemAPI,
  removeOrderItemAPI,
  fetchCartSuggestions,
  applyCouponCode,
  removeCouponCode,
} from "~/api/order.server";
import ProductRow from "~/components/cart/ProductRow";
import ProductsList from "~/components/ProductsList";
import { formatPrice } from "~/utils/price";
import { IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useOrder } from "~/context/OrderContext";
import FlashMessages from "~/components/layout/FlashMessages";
import {
  getFlashSession,
  commitFlashSession,
} from "~/utils/flashSession";
import type { OrderItem } from "~/types/Order";

type FlashMessage = {
  id: string;
  type: "success" | "error" | "info" | "warning";
  content: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  let token = await orderTokenCookie.parse(cookieHeader);
  if (typeof token !== "string") token = token?.token ?? token ?? "";

  let newToken = false;
  if (!token) {
    token = await pickupCart();
    newToken = true;
  }

  const flash = await getFlashSession(cookieHeader);
  const rawMessages = flash.get("messages");
  const messages = rawMessages ? JSON.parse(rawMessages) : [];

  const headers: Record<string, string> = {};
  const cookies: string[] = [];

  if (newToken) {
    cookies.push(await orderTokenCookie.serialize(token));
  }

  let order = null;
  try {
    order = await fetchOrderFromAPI(token, true);
  } catch (err) {
    console.warn("🛒 Failed to fetch order in CartPage loader, resetting cart...", err);
    token = await pickupCart();
    cookies.push(await orderTokenCookie.serialize(token));
    order = await fetchOrderFromAPI(token, true);
  }

  const products = await fetchCartSuggestions();
  cookies.push(await commitFlashSession(flash));

  if (cookies.length > 0) {
    headers["Set-Cookie"] = cookies as unknown as string;
  }

  return json({ order, token, products, messages }, { headers });
}

export async function action({ request }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const parsed = await orderTokenCookie.parse(cookieHeader);
  const token = typeof parsed === "string" ? parsed : parsed?.token ?? "";
  const form = await request.formData();

  const intent = form.get("_intent");
  const id = Number(form.get("id"));
  const quantity = Number(form.get("quantity"));
  const couponCode = form.get("couponCode")?.toString() ?? null;

  const flash = await getFlashSession(cookieHeader);

  try {
    if (intent === "update" && id && quantity >= 0) {
      await updateOrderItemAPI({ id, quantity, token });
    }

    if (intent === "remove" && id) {
      await removeOrderItemAPI({ id, token });
    }

    if (intent === "coupon:add" && couponCode) {
      try {
        await applyCouponCode(token, couponCode);
        flash.flash(
            "messages",
            JSON.stringify([
              {
                id: "coupon-success",
                type: "success",
                content: "Coupon applied successfully",
              },
            ])
        );
        return redirect(`/cart?appliedCoupon=${encodeURIComponent(couponCode)}`, {
          headers: {
            "Set-Cookie": await commitFlashSession(flash),
          },
        });
      } catch (e) {
        flash.flash(
            "messages",
            JSON.stringify([
              {
                id: "coupon-error",
                type: "error",
                content: "Invalid coupon code",
              },
            ])
        );
        return redirect("/cart", {
          headers: {
            "Set-Cookie": await commitFlashSession(flash),
          },
        });
      }
    }

    if (intent === "coupon:remove") {
      await removeCouponCode(token);
      flash.flash(
          "messages",
          JSON.stringify([
            {
              id: "coupon-removed",
              type: "info",
              content: "Coupon has been removed.",
            },
          ])
      );
      return redirect("/cart", {
        headers: {
          "Set-Cookie": await commitFlashSession(flash),
        },
      });
    }
  } catch (e) {
    flash.flash(
        "messages",
        JSON.stringify([
          {
            id: "cart-error",
            type: "error",
            content: "An unexpected error occurred",
          },
        ])
    );
    return redirect("/cart", {
      headers: {
        "Set-Cookie": await commitFlashSession(flash),
      },
    });
  }

  return redirect("/cart", {
    headers: {
      "Set-Cookie": await commitFlashSession(flash),
    },
  });
}

export default function CartPage() {
  const { order, products, messages } = useLoaderData<typeof loader>();
  const { fetchOrder } = useOrder();
  const fetcher = useFetcher();
  const items = order.items ?? [];

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const couponFromQuery = searchParams.get("appliedCoupon");

  const couponCode = order.promotionCoupon?.code ?? "";
  const isCouponActive = !!couponCode;

  const [flashMessages, setFlashMessages] = useState<FlashMessage[]>(messages || []);

  useEffect(() => {
    if (couponFromQuery || !couponCode) {
      fetchOrder();
    }
  }, [couponFromQuery, couponCode]);

  useEffect(() => {
    setFlashMessages(messages || []);
  }, [messages]);

  return (
      <Layout>
        <FlashMessages
            messages={flashMessages}
            removeMessage={(id) =>
                setFlashMessages((prev) => prev.filter((msg) => msg.id !== id))
            }
        />
        <div className="container mt-4 mb-5">
          <div className="mb-5">
            <h1>Your shopping cart</h1>
            <div>Edit your items, apply coupon or proceed to the checkout</div>
          </div>

          {items.length === 0 ? (
              <div className="alert alert-info">
                <div className="fw-bold">Info</div>
                Your cart is empty
              </div>
          ) : (
              <div className="row">
                <div className="col-12 col-xl-8 mb-4 position-relative">
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                      <tr>
                        <th></th>
                        <th>Item</th>
                        <th className="text-end text-nowrap">Unit price</th>
                        <th className="text-end">Qty</th>
                        <th className="text-end">Total</th>
                      </tr>
                      </thead>
                      <tbody>
                      {items.map((item: OrderItem) => (
                          <ProductRow
                              key={item.id}
                              item={item}
                              fetcher={fetcher}
                              fetchOrder={fetchOrder}
                          />
                      ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mb-4">
                    <div className="p-4 bg-light">
                      {couponCode && isCouponActive ? (
                          <fetcher.Form method="post" className="card d-flex flex-row justify-content-between align-items-center w-100 py-1 px-3">
                            <div className="d-flex flex-wrap">
                              <span className="me-2">Applied coupon:</span>
                              <span className="badge d-flex align-items-center text-bg-secondary">
                          {couponCode}
                        </span>
                            </div>
                            <button
                                type="submit"
                                name="_intent"
                                value="coupon:remove"
                                className="btn btn-sm btn-transparent d-flex align-items-center"
                                aria-label="Remove coupon"
                            >
                              <IconTrash stroke={1.5} />
                            </button>
                          </fetcher.Form>
                      ) : (
                          <fetcher.Form method="post" className="input-group">
                            <input
                                name="couponCode"
                                className="form-control"
                                placeholder="Enter your code..."
                                aria-label="Coupon code"
                            />
                            <button
                                type="submit"
                                name="_intent"
                                value="coupon:add"
                                className="btn btn-outline-secondary"
                            >
                              Apply coupon
                            </button>
                          </fetcher.Form>
                      )}
                    </div>
                  </div>

                  <div className="d-flex justify-content-end">
                    <button
                        className="btn btn-light"
                        onClick={() => {
                          items.forEach((item) => {
                            if (item.id !== undefined) {
                              fetcher.submit(
                                  { id: item.id, _intent: "remove" },
                                  { method: "post" }
                              );
                            }
                          });
                        }}
                    >
                      Clear cart
                    </button>
                  </div>
                </div>

                <div className="col-12 col-xl-4 ps-xl-5 mb-4">
                  <div className="p-4 bg-light mb-4 rounded-3">
                    <h3 className="mb-4">Summary</h3>
                    <div className="hstack gap-2 mb-2">
                      <div>Items total:</div>
                      <div className="ms-auto text-end">${formatPrice(order.itemsSubtotal)}</div>
                    </div>
                    {!!order.orderPromotionTotal && (
                        <div className="hstack gap-2 mb-2">
                          <div>Discount:</div>
                          <div className="ms-auto text-end">${formatPrice(order.orderPromotionTotal)}</div>
                        </div>
                    )}
                    <div className="hstack gap-2 mb-2">
                      <div>Estimated shipping cost:</div>
                      <div className="ms-auto text-end">${formatPrice(order.shippingTotal)}</div>
                    </div>
                    <div className="hstack gap-2 mb-2">
                      <div>Taxes total:</div>
                      <div className="ms-auto text-end">${formatPrice(order.taxTotal)}</div>
                    </div>
                    <div className="hstack gap-2 border-top pt-4 mt-4">
                      <div className="h5">Order total:</div>
                      <div className="ms-auto h5 text-end">${formatPrice(order.total)}</div>
                    </div>
                  </div>
                  <div className="d-flex">
                    <Link to="/checkout/address" className="btn btn-primary flex-grow-1">
                      Checkout
                    </Link>
                  </div>
                </div>
              </div>
          )}

          {products?.length > 0 && (
              <div className="mt-5">
                <ProductsList products={products} limit={4} name="You may also like" />
              </div>
          )}
        </div>
      </Layout>
  );
}
