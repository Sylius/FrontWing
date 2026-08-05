import {
  data,
  redirect,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "react-router";
import {
  useLoaderData,
  useFetcher,
  useLocation,
} from "react-router";
import Layout from "~/layouts/Default";
import { LocalizedLink } from "~/components/LocalizedLink";
import { localizePath } from "~/utils/localizedPath";
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
import { useCurrency } from "~/context/ChannelContext";
import { IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useOrder } from "~/context/OrderContext";
import FlashMessages from "~/components/layout/FlashMessages";
import {
  getFlashSession,
  commitFlashSession,
} from "~/utils/flashSession";
import type { OrderItem } from "~/types/Order";
import { useTranslation } from "react-i18next";

type FlashMessage = {
  id: string;
  type: "success" | "error" | "info" | "warning";
  content: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  let token = await orderTokenCookie.parse(cookieHeader);
  if (typeof token !== "string") token = token?.token ?? token ?? "";

  if (!token) {
    token = await pickupCart();
  }

  const flash = await getFlashSession(cookieHeader);
  const rawMessages = flash.get("messages");
  const messages = rawMessages ? JSON.parse(rawMessages) : [];

  const headers: Record<string, string> = {};
  const cookies: string[] = [];

  cookies.push(await orderTokenCookie.serialize(token));

  let order = null;
  try {
    order = await fetchOrderFromAPI(token, true);
  } catch (err) {
    token = await pickupCart();
    cookies.push(await orderTokenCookie.serialize(token));
    order = await fetchOrderFromAPI(token, true);
  }

  const products = await fetchCartSuggestions();
  cookies.push(await commitFlashSession(flash));

  if (cookies.length > 0) {
    headers["Set-Cookie"] = cookies.join("; ");
  }

  return data({ order, token, products, messages }, { headers });
}

export async function action({ request, params }: ActionFunctionArgs) {
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
        flash.flash("messages", JSON.stringify([
          { id: "coupon-success", type: "success", content: "Coupon applied successfully" },
        ]));
        return redirect(localizePath(params.lang!, `/cart?appliedCoupon=${encodeURIComponent(couponCode)}`), {
          headers: {
            "Set-Cookie": await commitFlashSession(flash),
          },
        });
      } catch (e) {
        flash.flash("messages", JSON.stringify([
          { id: "coupon-error", type: "error", content: "Invalid coupon code" },
        ]));
        return redirect(localizePath(params.lang!, "/cart"), {
          headers: {
            "Set-Cookie": await commitFlashSession(flash),
          },
        });
      }
    }

    if (intent === "coupon:remove") {
      await removeCouponCode(token);
      flash.flash("messages", JSON.stringify([
        { id: "coupon-removed", type: "info", content: "Coupon has been removed." },
      ]));
      return redirect(localizePath(params.lang!, "/cart"), {
        headers: {
          "Set-Cookie": await commitFlashSession(flash),
        },
      });
    }
  } catch (e) {
    flash.flash("messages", JSON.stringify([
      { id: "cart-error", type: "error", content: "An unexpected error occurred" },
    ]));
    return redirect(localizePath(params.lang!, "/cart"), {
      headers: {
        "Set-Cookie": await commitFlashSession(flash),
      },
    });
  }

  return redirect(localizePath(params.lang!, "/cart"), {
    headers: {
      "Set-Cookie": await commitFlashSession(flash),
    },
  });
}

export default function CartPage() {
  const { t } = useTranslation("cart");
  const { formatPrice } = useCurrency();
  const { order: contextOrder, orderToken, fetchOrder } = useOrder();
  const { order: loaderOrder, token: loaderToken, products, messages } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [flashMessages, setFlashMessages] = useState<FlashMessage[]>(messages || []);

  const orderMismatch = loaderToken !== orderToken;
  const currentOrder = orderMismatch ? contextOrder : loaderOrder;

  const items = currentOrder?.items ?? [];
  const couponCode = currentOrder?.promotionCoupon?.code ?? "";
  const isCouponActive = !!couponCode;

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const couponFromQuery = searchParams.get("appliedCoupon");

  useEffect(() => {
    if (!orderToken) return;
    if (orderMismatch) {
      fetchOrder();
    }
  }, [orderMismatch, orderToken]);

  useEffect(() => {
    if (!orderToken) return;
    if (couponFromQuery || !couponCode) {
      fetchOrder();
    }
  }, [couponFromQuery, couponCode, orderToken]);

  useEffect(() => {
    setFlashMessages(messages || []);
  }, [messages]);

  if (!orderToken) return null;

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
            <h1>{t("page.title")}</h1>
            <div>{t("page.subtitle")}</div>
          </div>

          {items.length === 0 ? (
              <div className="alert alert-info">
                <div className="fw-bold">{t("empty.info")}</div>
                {t("empty.message")}
              </div>
          ) : (
              <div className="row">
                <div className="col-12 col-xl-8 mb-4 position-relative">
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                      <tr>
                        <th></th>
                        <th>{t("table.item")}</th>
                        <th className="text-end text-nowrap">{t("table.unitPrice")}</th>
                        <th className="text-end">{t("table.quantity")}</th>
                        <th className="text-end">{t("table.total")}</th>
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
                              <span className="me-2">{t("coupon.applied")}</span>
                              <span className="badge d-flex align-items-center text-bg-secondary">
                          {couponCode}
                        </span>
                            </div>
                            <button
                                type="submit"
                                name="_intent"
                                value="coupon:remove"
                                className="btn btn-sm btn-transparent d-flex align-items-center"
                                aria-label={t("coupon.remove")}
                            >
                              <IconTrash stroke={1.5} />
                            </button>
                          </fetcher.Form>
                      ) : (
                          <fetcher.Form method="post" className="input-group">
                            <input
                                name="couponCode"
                                className="form-control"
                                placeholder={t("coupon.placeholder")}
                                aria-label={t("coupon.label")}
                            />
                            <button
                                type="submit"
                                name="_intent"
                                value="coupon:add"
                                className="btn btn-outline-secondary"
                            >
                              {t("coupon.apply")}
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
                      {t("page.clearCart")}
                    </button>
                  </div>
                </div>

                <div className="col-12 col-xl-4 ps-xl-5 mb-4">
                  <div className="p-4 bg-light mb-4 rounded-3">
                    <h3 className="mb-4">{t("summary.title")}</h3>
                    <div className="hstack gap-2 mb-2">
                      <div>{t("summary.itemsTotal")}</div>
                      <div className="ms-auto text-end">{formatPrice(currentOrder?.itemsSubtotal ?? 0)}</div>
                    </div>
                    {!!currentOrder?.orderPromotionTotal && (
                        <div className="hstack gap-2 mb-2">
                          <div>{t("summary.discount")}</div>
                          <div className="ms-auto text-end">{formatPrice(currentOrder.orderPromotionTotal)}</div>
                        </div>
                    )}
                    <div className="hstack gap-2 mb-2">
                      <div>{t("summary.shipping")}</div>
                      <div className="ms-auto text-end">{formatPrice(currentOrder?.shippingTotal ?? 0)}</div>
                    </div>
                    <div className="hstack gap-2 mb-2">
                      <div>{t("summary.taxes")}</div>
                      <div className="ms-auto text-end">{formatPrice(currentOrder?.taxTotal ?? 0)}</div>
                    </div>
                    <div className="hstack gap-2 border-top pt-4 mt-4">
                      <div className="h5">{t("summary.orderTotal")}</div>
                      <div className="ms-auto h5 text-end">{formatPrice(currentOrder?.total ?? 0)}</div>
                    </div>
                  </div>
                  <div className="d-flex">
                    <LocalizedLink to="/checkout/address" className="btn btn-primary flex-grow-1">
                      {t("page.checkout")}
                    </LocalizedLink>
                  </div>
                </div>
              </div>
          )}

          {products?.length > 0 && (
              <div className="mt-5">
                <ProductsList products={products} limit={4} name={t("page.suggestions")} />
              </div>
          )}
        </div>
      </Layout>
  );
}
