import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "@remix-run/node";
import {
  useLoaderData,
  useNavigation,
  Form,
} from "@remix-run/react";
import CheckoutLayout from "~/layouts/Checkout";
import { useOrder } from "~/context/OrderContext";
import Steps from "~/components/checkout/Steps";
import { formatPrice } from "~/utils/price";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { orderTokenCookie } from "~/utils/cookies.server"; // ✅ POPRAWNY dla loadera i action
import { fetchOrderFromAPI } from "~/api/order.server";
import { Link } from "@remix-run/react";

interface ShippingMethod {
  id: number;
  code: string;
  name: string;
  description?: string;
  price: number;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token = await orderTokenCookie.parse(cookieHeader);

  if (!token) return redirect("/cart");

  const order = await fetchOrderFromAPI(token, true);

  const shipmentId = order?.shipments?.[0]?.id;
  if (!shipmentId) {
    return json({
      shippingMethods: [],
      token,
      shipmentId: null,
    });
  }

  const res = await fetch(
      `${process.env.PUBLIC_API_URL}/api/v2/shop/orders/${token}/shipments/${shipmentId}/methods`
  );
  const jsonData = await res.json();

  return json({
    shippingMethods: jsonData["hydra:member"] || [],
    token,
    shipmentId,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const shippingMethod = form.get("shippingMethod")?.toString();
  const token = form.get("token")?.toString();
  const shipmentId = form.get("shipmentId")?.toString();

  if (!token || !shipmentId || !shippingMethod) return redirect("/checkout/address");

  await fetch(
      `${process.env.PUBLIC_API_URL}/api/v2/shop/orders/${token}/shipments/${shipmentId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/merge-patch+json" },
        body: JSON.stringify({ shippingMethod }),
      }
  );

  return redirect("/checkout/select-payment");
}

export default function ShippingPage() {
  const { shippingMethods, token, shipmentId } = useLoaderData<{
    shippingMethods: ShippingMethod[];
    token: string;
    shipmentId: number | null;
  }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
      <CheckoutLayout>
        <div className="col-12 col-lg-7 pt-4 pb-5">
          <Steps activeStep="shipping" />
          <Form method="post" replace>
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="shipmentId" value={shipmentId ?? ""} />

            <h5 className="mb-4">Shipment #1</h5>

            <div className="mb-5">
              {shippingMethods.length === 0 ? (
                  <div className="text-danger">
                    No shipping methods available. Check your address.
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
              <Link className="btn btn-light btn-icon" to="/checkout/address">
                <IconChevronLeft stroke={2} />
                Change address
              </Link>

              <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-icon"
              >
                Next
                <IconChevronRight stroke={2} />
              </button>
            </div>
          </Form>
        </div>
      </CheckoutLayout>
  );
}
