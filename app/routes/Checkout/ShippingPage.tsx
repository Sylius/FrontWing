export const handle = { i18n: ["common","checkout"] };

import {
  redirect,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "react-router";
import {
  useLoaderData,
  useNavigation,
  Form,
} from "react-router";
import { useTranslation } from "react-i18next";
import CheckoutLayout from "~/layouts/Checkout";
import { useOrder } from "~/context/OrderContext";
import Steps from "~/components/checkout/Steps";
import { useCurrency } from "~/context/ChannelContext";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { readOrderToken } from "~/utils/orderTokenCookie";
import { fetchOrderFromAPI } from "~/api/order.server";
import { LocalizedLink } from "~/components/LocalizedLink";
import { localizePath } from "~/utils/localizedPath";

interface ShippingMethod {
  id: number;
  code: string;
  name: string;
  description?: string;
  price: number;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token = readOrderToken(cookieHeader);

  if (!token) return redirect(localizePath(params.lang!, "/cart"));

  const order = await fetchOrderFromAPI(token, true);

  const shipmentId = order?.shipments?.[0]?.id;
  if (!shipmentId) {
    return {
      shippingMethods: [],
      token,
      shipmentId: null,
    };
  }

  const res = await fetch(
      `${process.env.PUBLIC_API_URL}/api/v2/shop/orders/${token}/shipments/${shipmentId}/methods`
  );
  const jsonData = await res.json();

  return {
    shippingMethods: jsonData["hydra:member"] || [],
    token,
    shipmentId,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const form = await request.formData();
  const shippingMethod = form.get("shippingMethod")?.toString();
  const token = form.get("token")?.toString();
  const shipmentId = form.get("shipmentId")?.toString();

  if (!token || !shipmentId || !shippingMethod) return redirect(localizePath(params.lang!, "/checkout/address"));

  await fetch(
      `${process.env.PUBLIC_API_URL}/api/v2/shop/orders/${token}/shipments/${shipmentId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/merge-patch+json" },
        body: JSON.stringify({ shippingMethod }),
      }
  );

  return redirect(localizePath(params.lang!, "/checkout/select-payment"));
}

export default function ShippingPage() {
  const { shippingMethods, token, shipmentId } = useLoaderData<{
    shippingMethods: ShippingMethod[];
    token: string;
    shipmentId: number | null;
  }>();
  const { t } = useTranslation("checkout");
  const { formatPrice } = useCurrency();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
      <CheckoutLayout>
        <div className="col-12 col-lg-7 pt-4 pb-5">
          <Steps activeStep="shipping" />
          <Form method="post" replace>
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="shipmentId" value={shipmentId ?? ""} />

            <h5 className="mb-4">{t("shipping.shipmentTitle", { number: 1 })}</h5>

            <div className="mb-5">
              {shippingMethods.length === 0 ? (
                  <div className="text-danger">
                    {t("shipping.noMethods")}
                  </div>
              ) : (
                  shippingMethods.map((method) => (
                      <div key={method.id} className="card bg-body-tertiary border-0 mb-3">
                        <label className="d-flex gap-3 card-body">
                          <div className="flex-grow-1">
                            <div className="form-check">
                              <input
                                  type="radio"
                                  id={`shipping-method-${method.id}`}
                                  name="shippingMethod"
                                  required
                                  className="form-check-input"
                                  value={method.code}
                              />
                              <label
                                  className="form-check-label required"
                                  htmlFor={`shipping-method-${method.id}`}
                              >
                                {method.name}
                              </label>
                            </div>
                            {method.description && (
                                <div className="ps-4">
                                  <small className="text-black-50">{method.description}</small>
                                </div>
                            )}
                          </div>
                          <div>{formatPrice(method.price)}</div>
                        </label>
                      </div>
                  ))
              )}
            </div>

            <div className="d-flex justify-content-between flex-column flex-sm-row gap-2">
              <LocalizedLink className="btn btn-light btn-icon" to="/checkout/address">
                <IconChevronLeft stroke={2} />
                {t("shipping.changeAddress")}
              </LocalizedLink>

              <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-icon"
              >
                {t("shipping.next")}
                <IconChevronRight stroke={2} />
              </button>
            </div>
          </Form>
        </div>
      </CheckoutLayout>
  );
}
