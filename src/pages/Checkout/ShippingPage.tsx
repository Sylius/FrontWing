import React, { useState } from 'react';

import CheckoutLayout from '../../layouts/Checkout';
import { Link } from 'react-router';
import { useOrder } from '../../context/OrderContext';
import { useQuery } from '@tanstack/react-query';
import { formatPrice } from '../../utils/price';
import { useNavigate } from 'react-router-dom';
import Steps from '../../components/checkout/Steps';
import {IconChevronLeft, IconChevronRight} from "@tabler/icons-react";

const ShippingPage: React.FC = () => {
  const { order } = useOrder();
  const navigate = useNavigate();

  const fetchShippingMethodsFromAPI = async (): Promise<any> => {
    const response = await fetch(
      `${
        import.meta.env.VITE_REACT_APP_API_URL
      }/api/v2/shop/orders/${localStorage.getItem('orderToken')}/shipments/${
        order?.shipments[0].id
      }/methods`
    );
    if (!response.ok) {
      throw new Error('Problem z pobieraniem metod dostawy');
    }

    const data = await response.json();

    return data['hydra:member'] || data;
  };

  const { data: shippingMethods } = useQuery({
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
        `${
          import.meta.env.VITE_REACT_APP_API_URL
        }/api/v2/shop/orders/${localStorage.getItem('orderToken')}/shipments/${
          order.shipments[0].id
        }`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/merge-patch+json' },
          body: JSON.stringify({ shippingMethod }),
        }
      );

      if (!response.ok) {
        setHasErrors(true);
        throw new Error('Nie udało się wysłać metody dostawy');
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
      <div className="col-12 col-lg-7 pt-4 pb-5">
        <div>
          <Steps activeStep="shipping" />

          <div className="pe-lg-6">
            <form
              name="sylius_shop_checkout_select_shipping"
              method="post"
              noValidate={true}
              onSubmit={handleSubmit}
            >
              <input type="hidden" name="_method" value="PUT" />

              <h5 className="mb-4">Shipment #1</h5>

              <div className="mb-5">
                {hasErrors && (
                  <div className="invalid-feedback d-block">
                    Please select shipping method.
                  </div>
                )}
                {shippingMethods &&
                  shippingMethods.map((method: any) => (
                    <div
                      key={method.id}
                      className="card bg-body-tertiary border-0 mb-3"
                    >
                      <label className="d-flex gap-3 card-body">
                        <div className="flex-grow-1">
                          <div>
                            <div className="form-check">
                              <input
                                type="radio"
                                id={`shipping-method-${method.id}`}
                                name="shipping-methods"
                                required={true}
                                className="form-check-input"
                                onChange={() => setShippingMethod(method.code)}
                                checked={shippingMethod === method.code}
                                value={method.code}
                              />
                              <label
                                className="form-check-label required"
                                htmlFor="sylius_shop_checkout_select_shipping_shipments_0_method_0"
                              >
                                {method.name}
                              </label>
                            </div>
                          </div>

                          <div className="ps-4">
                            <small className="text-black-50">
                              {method.description}
                            </small>
                          </div>
                        </div>

                        <div>{formatPrice(method.price)}</div>
                      </label>
                    </div>
                  ))}
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
            </form>
          </div>
        </div>
      </div>
    </CheckoutLayout>
  );
};

export default ShippingPage;
