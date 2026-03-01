import React, { useEffect, useState } from "react";
import CheckoutLayout from "../../layouts/Checkout";
import { Link } from "react-router-dom";
import { useOrder } from "../../context/OrderContext";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Steps from "../../components/checkout/Steps";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface PaymentMethod {
  id: number;
  code: string;
  name: string;
  description?: string;
}

const PaymentPage: React.FC = () => {
  const { order, fetchOrder } = useOrder();
  const navigate = useNavigate();

  const fetchPaymentMethodsFromAPI = async (): Promise<PaymentMethod[]> => {
    const response = await fetch(
      `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/orders/${localStorage.getItem(
        "orderToken"
      )}/payments/${order?.payments?.[0]?.id}/methods`
    );
    if (!response.ok) {
      throw new Error("Problem with downloading payment methods");
    }

    const data = await response.json();
    return data["hydra:member"] || [];
  };

  const { data: paymentMethods } = useQuery<PaymentMethod[]>({
    queryKey: ["payment-methods"],
    queryFn: fetchPaymentMethodsFromAPI,
    enabled: order !== null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [hasErrors, setHasErrors] = useState(false);

  useEffect(() => {
    if (paymentMethods && paymentMethods.length > 0 && !paymentMethod) {
      setPaymentMethod(paymentMethods[0].code);
    }
  }, [paymentMethods, paymentMethod]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/orders/${localStorage.getItem(
          "orderToken"
        )}/payments/${order?.payments?.[0]?.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/merge-patch+json" },
          body: JSON.stringify({
            paymentMethod: paymentMethod || order?.payments?.[0]?.method,
          }),
        }
      );

      if (!response.ok) {
        setHasErrors(true);
        throw new Error("Failed to send payment methods");
      }

      await fetchOrder();
      navigate("/checkout/complete");
    } catch (error) {
      console.error("Error submitting payment method:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CheckoutLayout>
      <div className="w-full pt-4 pb-5 lg:w-7/12">
        <div className="lg:pr-20">
          <Steps activeStep="payment" />

          <form
            name="sylius_shop_checkout_select_payment"
            method="post"
            onSubmit={handleSubmit}
            noValidate
          >
            <input type="hidden" name="_method" value="PUT" />

            <h5 className="mb-4 text-base font-semibold">Payment #1</h5>

            <div className="mb-5">
              {hasErrors && (
                <div className="text-destructive mb-3 text-sm">Please select payment method.</div>
              )}

              {paymentMethods?.length === 0 && (
                <div className="bg-muted mb-3 rounded-lg p-4">
                  <h6 className="text-destructive mb-1 font-semibold">Warning</h6>
                  <p className="mb-0 text-sm">
                    There are currently no payment methods available for your order.
                  </p>
                </div>
              )}

              {paymentMethods?.map((method) => (
                <div className="bg-muted mb-3 rounded-lg" key={method.id}>
                  <label className="block cursor-pointer p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id={`payment-method-${method.id}`}
                          name="sylius_shop_checkout_select_payment[payments][0][method]"
                          required
                          className="accent-primary"
                          onChange={() => setPaymentMethod(method.code)}
                          checked={paymentMethod === method.code}
                          value={method.code}
                        />
                        <label
                          className="cursor-pointer text-sm font-medium"
                          htmlFor={`payment-method-${method.id}`}
                        >
                          {method.name}
                        </label>
                      </div>
                    </div>

                    <div className="mt-1 pl-6">
                      <small className="text-muted-foreground">{method.description}</small>
                    </div>
                  </label>
                </div>
              ))}
            </div>

            <div className="flex flex-col justify-between gap-2 sm:flex-row">
              <Button variant="outline" render={<Link to="/checkout/select-shipping" />}>
                <IconChevronLeft stroke={2} />
                Change shipping method
              </Button>

              <Button type="submit" disabled={isSubmitting}>
                Next
                <IconChevronRight stroke={2} />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </CheckoutLayout>
  );
};

export default PaymentPage;
