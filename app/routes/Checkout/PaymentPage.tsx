import React, { useEffect, useState } from 'react';
import CheckoutLayout from '../../layouts/Checkout';
import { Link, useNavigate } from 'react-router-dom';
import { useOrder } from '../../context/OrderContext';
import { useQuery } from '@tanstack/react-query';
import Steps from '../../components/checkout/Steps';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

interface PaymentMethod {
  id: number;
  code: string;
  name: string;
  description?: string;
}

const PaymentPage: React.FC = () => {
  const { order, fetchOrder, orderToken } = useOrder();
  const navigate = useNavigate();

  const fetchPaymentMethodsFromAPI = async (): Promise<PaymentMethod[]> => {
    if (!order || !orderToken || !order.payments?.[0]?.id) throw new Error("Missing order info");

    const response = await fetch(
        `${window.ENV?.API_URL}/api/v2/shop/orders/${orderToken}/payments/${order.payments[0].id}/methods`
    );

    if (!response.ok) throw new Error('Problem with downloading payment methods');
    const data = await response.json();
    return data['hydra:member'] || [];
  };

  const { data: paymentMethods } = useQuery<PaymentMethod[]>({
    queryKey: ['payment-methods', order?.payments?.[0]?.id],
    queryFn: fetchPaymentMethodsFromAPI,
    enabled: !!order && !!order.payments?.[0]?.id && !!orderToken,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [hasErrors, setHasErrors] = useState(false);

  useEffect(() => {
    if (paymentMethods?.length && !paymentMethod) {
      setPaymentMethod(paymentMethods[0].code);
    }
  }, [paymentMethods, paymentMethod]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(
          `${window.ENV?.API_URL}/api/v2/shop/orders/${orderToken}/payments/${order?.payments?.[0]?.id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/merge-patch+json' },
            body: JSON.stringify({
              paymentMethod: paymentMethod || order?.payments?.[0]?.method,
            }),
          }
      );

      if (!response.ok) {
        setHasErrors(true);
        throw new Error('Failed to send payment method');
      }

      await fetchOrder();
      navigate('/checkout/complete');
    } catch (error) {
      console.error('Error submitting payment method:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <CheckoutLayout>
        <div className="col-12 col-lg-7 pt-4 pb-5">
          <div className="pe-lg-6">
            <Steps activeStep="payment" />

            <form name="sylius_shop_checkout_select_payment" method="post" onSubmit={handleSubmit} noValidate>
              <input type="hidden" name="_method" value="PUT" />
              <h5 className="mb-4">Payment #1</h5>

              <div className="mb-5">
                {hasErrors && (
                    <div className="invalid-feedback d-block">
                      Please select a payment method.
                    </div>
                )}

                {paymentMethods?.length === 0 && (
                    <div className="card bg-body-tertiary border-0 mb-3">
                      <div className="card-body">
                        <h6 className="text-danger mb-1">Warning</h6>
                        <p className="mb-0">No payment methods available for your order.</p>
                      </div>
                    </div>
                )}

                {paymentMethods?.map((method) => (
                    <div key={method.id} className="card bg-body-tertiary border-0 mb-3">
                      <label className="card-body">
                        <div className="form-check">
                          <input
                              type="radio"
                              id={`payment-method-${method.id}`}
                              name="paymentMethod"
                              required
                              className="form-check-input"
                              onChange={() => setPaymentMethod(method.code)}
                              checked={paymentMethod === method.code}
                              value={method.code}
                          />
                          <label className="form-check-label required" htmlFor={`payment-method-${method.id}`}>
                            {method.name}
                          </label>
                        </div>
                        <div className="ps-4">
                          <small className="text-black-50">{method.description}</small>
                        </div>
                      </label>
                    </div>
                ))}
              </div>

              <div className="d-flex justify-content-between flex-column flex-sm-row gap-2">
                <Link className="btn btn-light btn-icon" to="/checkout/select-shipping">
                  <IconChevronLeft stroke={2} />
                  Change shipping method
                </Link>

                <button type="submit" className="btn btn-primary btn-icon" disabled={isSubmitting}>
                  Next
                  <IconChevronRight stroke={2} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </CheckoutLayout>
  );
};

export default PaymentPage;
