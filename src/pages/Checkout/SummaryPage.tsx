import React, { useEffect, useState } from 'react';
import CheckoutLayout from '../../layouts/Checkout';
import { useOrder } from '../../context/OrderContext';
import Address from '../../components/Address';
import PaymentsCard from '../../components/order/PaymentsCard';
import ShipmentsCard from '../../components/order/ShipmentsCard';
import ProductRow from '../../components/order/ProductRow';
import { OrderItem } from '../../types/Order';
import { formatPrice } from '../../utils/price';
import { useNavigate } from 'react-router-dom';
import Steps from '../../components/checkout/Steps';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


const SummaryPage: React.FC = () => {
  const { order, fetchOrder, setOrderToken } = useOrder();

  const navigate = useNavigate();

  const [extraNotes, setExtraNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const orderToken = localStorage.getItem('orderToken');

    try {
      const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/orders/${orderToken}/complete`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/merge-patch+json' },
            body: JSON.stringify({ notes: extraNotes }),
          }
      );

      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

      setOrderToken(null);
      localStorage.removeItem('orderToken');
      navigate('/order/thank-you', {
        state: { tokenValue: order?.tokenValue },
      });
    } catch (error) {
      console.error('Error submitting order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return (
      <CheckoutLayout sidebarOn={false}>
        <div className="flex-1 pt-4 pb-5">
          <div className="mx-auto">
            <Steps activeStep="complete" />
            <h1 className="text-lg font-semibold mb-4">Order #{order?.number}</h1>

            {order && (
                <div className="bg-muted rounded-lg mb-3">
                  <div className="p-4 flex flex-col gap-1">
                    <div className="flex flex-wrap -mx-4">
                      <div className="w-full sm:w-1/3 px-4">Currency</div>
                      <div className="flex-1 px-4">{order.currencyCode}</div>
                    </div>
                    <div className="flex flex-wrap -mx-4">
                      <div className="w-full sm:w-1/3 px-4">Locale</div>
                      <div className="flex-1 px-4">{order.localeCode}</div>
                    </div>
                  </div>
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="flex flex-wrap -mx-4">
                <div className="w-full md:w-1/2 px-4 mb-3">
                  {order?.billingAddress && (
                      <Address sectionName="Billing address" address={order.billingAddress} />
                  )}
                </div>
                <div className="w-full md:w-1/2 px-4 mb-3">
                  {order?.shippingAddress && (
                      <Address sectionName="Shipping address" address={order.shippingAddress} />
                  )}
                </div>
              </div>

              <div className="mb-5">
                {order?.payments && (
                    <PaymentsCard
                        payment={order?.payments[0]}
                        total={order?.total ?? 0}
                        paymentState={order?.paymentState}
                    />
                )}
                {order?.shipments && <ShipmentsCard shipment={order?.shipments[0]} />}
              </div>

              <div className="border-b mb-4">
                <Table>
                  <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Item</TableHead>
                    <TableHead className="text-right">Unit price</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                  </TableHeader>
                  <TableBody>
                  {order?.items?.map((item: OrderItem) => (
                      <ProductRow orderItem={item} key={item.id} />
                  ))}
                  </TableBody>
                </Table>
              </div>

              <Table className="ml-auto mb-6">
                <TableBody>
                <TableRow>
                  <TableCell className="text-right w-3/4 py-1 pr-4">Items total:</TableCell>
                  <TableCell className="text-right py-1">${formatPrice(order?.itemsSubtotal ?? 0)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-right pr-4 py-1">Taxes total:</TableCell>
                  <TableCell className="text-right py-1">
                    <div>${formatPrice(order?.taxTotal ?? 0)}</div>
                    <small className="text-muted-foreground">Included in price</small>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-right pr-4 py-1">Discount:</TableCell>
                  <TableCell className="text-right py-1">${formatPrice(order?.orderPromotionTotal ?? 0)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-right pr-4 py-1">Shipping total:</TableCell>
                  <TableCell className="text-right py-1">${formatPrice(order?.shippingTotal ?? 0)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-lg font-semibold text-right border-t pt-4 pr-4">Total:</TableCell>
                  <TableCell className="text-lg font-semibold text-right border-t pt-4">${formatPrice(order?.total ?? 0)}</TableCell>
                </TableRow>
                </TableBody>
              </Table>

              <div className="mb-3">
                <label htmlFor="sylius_checkout_complete_notes" className="block text-sm font-medium mb-1">
                  Extra notes
                </label>
                <Textarea
                    id="sylius_checkout_complete_notes"
                    value={extraNotes}
                    onChange={(e) => setExtraNotes(e.target.value)}
                />
              </div>

              <div className="text-center">
                <Button type="submit" disabled={isSubmitting}>
                  Place order
                </Button>
              </div>
            </form>
          </div>
        </div>
      </CheckoutLayout>
  );
};

export default SummaryPage;
