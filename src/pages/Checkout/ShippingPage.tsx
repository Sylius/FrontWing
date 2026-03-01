import React, { useState } from 'react';

import CheckoutLayout from '../../layouts/Checkout';
import { Link } from 'react-router-dom';
import { useOrder } from '../../context/OrderContext';
import { useQuery } from '@tanstack/react-query';
import { formatPrice } from '../../utils/price';
import { useNavigate } from 'react-router-dom';
import Steps from '../../components/checkout/Steps';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

interface ShippingMethod {
  id: number;
  code: string;
  name: string;
  description?: string;
  price: number;
}

const ShippingPage: React.FC = () => {
  const { order } = useOrder();
  const navigate = useNavigate();

  const fetchShippingMethodsFromAPI = async (): Promise<ShippingMethod[]> => {
    const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/orders/${localStorage.getItem('orderToken')}/shipments/${order?.shipments?.[0]?.id}/methods`
    );
    if (!response.ok) {
      throw new Error('Error while downloading shipping method');
    }

    const data = await response.json();
    return data['hydra:member'] || [];
  };

  const { data: shippingMethods } = useQuery<ShippingMethod[]>({
    queryKey: ['shipping-methods'],
    queryFn: fetchShippingMethodsFromAPI,
    enabled: order !== null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('');
  const [hasErrors, setHasErrors] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/orders/${localStorage.getItem('orderToken')}/shipments/${order?.shipments?.[0]?.id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/merge-patch+json' },
            body: JSON.stringify({ shippingMethod }),
          }
      );

      if (!response.ok) {
        setHasErrors(true);
        throw new Error('Failed to send delivery method');
      }

      navigate('/checkout/select-payment');
    } catch (error) {
      console.error('Error submitting order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <CheckoutLayout>
        <div className="w-full lg:w-7/12 pt-4 pb-5">
          <div>
            <Steps activeStep="shipping" />

            <div className="lg:pr-20">
              <form
                  name="sylius_shop_checkout_select_shipping"
                  method="post"
                  noValidate
                  onSubmit={handleSubmit}
              >
                <input type="hidden" name="_method" value="PUT" />

                <h5 className="text-base font-semibold mb-4">Shipment #1</h5>

                <div className="mb-5">
                  {hasErrors && (
                      <div className="text-destructive text-sm mb-3">
                        Please select shipping method.
                      </div>
                  )}

                  {(shippingMethods ?? []).length === 0 && (
                      <div className="bg-muted rounded-lg p-4 mb-3">
                        <h6 className="text-destructive font-semibold mb-1">Warning</h6>
                        <p className="mb-0 text-sm">
                          There are currently no shipping methods available for your shipping address.
                        </p>
                      </div>
                  )}

                  {(shippingMethods ?? []).map((method) => (
                      <div key={method.id} className="bg-muted rounded-lg mb-3">
                        <label className="flex gap-3 p-4 cursor-pointer">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <input
                                  type="radio"
                                  id={`shipping-method-${method.id}`}
                                  name="shipping-methods"
                                  required
                                  className="accent-primary"
                                  onChange={() => setShippingMethod(method.code)}
                                  checked={shippingMethod === method.code}
                                  value={method.code}
                              />
                              <label
                                  className="text-sm font-medium cursor-pointer"
                                  htmlFor={`shipping-method-${method.id}`}
                              >
                                {method.name}
                              </label>
                            </div>

                            <div className="pl-6 mt-1">
                              <small className="text-muted-foreground">{method.description}</small>
                            </div>
                          </div>

                          <div className="text-sm">{formatPrice(method.price)}</div>
                        </label>
                      </div>
                  ))}
                </div>

                <div className="flex justify-between flex-col sm:flex-row gap-2">
                  <Button variant="outline" render={<Link to="/checkout/address" />}>
                    <IconChevronLeft stroke={2} />
                    Change address
                  </Button>

                  <Button
                      type="submit"
                      disabled={isSubmitting}
                  >
                    Next
                    <IconChevronRight stroke={2} />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </CheckoutLayout>
  );
};

export default ShippingPage;
