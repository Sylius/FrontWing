import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { Link } from 'react-router-dom';
import ProductRow from '../components/cart/ProductRow';
import Layout from '../layouts/Default';
import { Order, OrderItem } from '../types/Order';
import { formatPrice } from '../utils/price';

const fetchCart = async (): Promise<Order> => {
  const response = await fetch(
      `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/orders/${localStorage.getItem('orderToken')}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch cart');
  }

  const data = await response.json();
  return data;
};

const removeCartItem = async (id: number): Promise<void> => {
  const response = await fetch(
      `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/orders/${localStorage.getItem('orderToken')}/items/${id}`,
      { method: 'DELETE' }
  );
  if (!response.ok) throw new Error('Failed to remove item from cart');
};

interface UpdateCartItemPayload {
  id: number;
  quantity: number;
}

const updateCartItem = async ({ id, quantity }: UpdateCartItemPayload): Promise<void> => {
  const response = await fetch(
      `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/orders/${localStorage.getItem('orderToken')}/items/${id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/merge-patch+json' },
        body: JSON.stringify({ quantity }),
      }
  );
  if (!response.ok) throw new Error('Failed to update item quantity');
};

const debounce = <T extends unknown[]>(func: (...args: T) => void, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: T) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

const CartPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: order } = useQuery<Order>({
    queryKey: ['order'],
    queryFn: fetchCart,
  });

  const removeMutation = useMutation({
    mutationFn: removeCartItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['order'] }),
  });

  const updateMutation = useMutation({
    mutationFn: updateCartItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['order'] }),
  });

  const debouncedUpdate = debounce((id: number, quantity: number) => {
    updateMutation.mutate({ id, quantity });
  }, 500);

  return (
      <Layout>
        <div className="container mt-4 mb-5">
          <div className="mb-5">
            <h1>Your shopping cart</h1>
            <div>Edit your items, apply coupon or proceed to the checkout</div>
          </div>
          {order?.items?.length === 0 ? (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded p-3">
                <div className="font-bold">Info</div>
                Your cart is empty
              </div>
          ) : (
              <div className="flex flex-wrap -mx-4">
                <div className="w-full xl:w-2/3 px-4 mb-4 relative">
                  <Table>
                    <TableHeader>
                    <TableRow>
                      <TableHead style={{ width: '1px' }}></TableHead>
                      <TableHead className="text-left">Item</TableHead>
                      <TableHead style={{ width: '90px' }} className="text-right whitespace-nowrap">Unit price</TableHead>
                      <TableHead style={{ minWidth: '70px', width: '110px' }} className="text-right">Qty</TableHead>
                      <TableHead style={{ width: '90px' }} className="text-right">Total</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {order?.items?.map((orderItem: OrderItem) => (
                        <ProductRow
                            key={orderItem.id}
                            orderItem={orderItem}
                            onRemove={removeMutation.mutate}
                            onUpdate={debouncedUpdate}
                        />
                    ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="w-full xl:w-1/3 xl:pl-20 px-4 mb-4">
                  <div className="p-4 bg-muted mb-4 rounded-xl">
                    <h3 className="mb-4">Summary</h3>
                    <div className="flex justify-between mb-2">
                      <div>Items total:</div>
                      <div className="text-right">${formatPrice(order?.itemsSubtotal)}</div>
                    </div>
                    <div className="flex justify-between mb-2">
                      <div>Estimated shipping cost:</div>
                      <div className="text-right">${formatPrice(order?.shippingTotal)}</div>
                    </div>
                    <div className="flex justify-between mb-2">
                      <div>Taxes total:</div>
                      <div className="text-right">${formatPrice(order?.taxTotal)}</div>
                    </div>
                    <div className="flex justify-between border-t pt-4 mt-4">
                      <div className="text-lg font-semibold">Order total:</div>
                      <div className="text-lg font-semibold text-right">${formatPrice(order?.total)}</div>
                    </div>
                  </div>
                  <div className="flex">
                    <Link to="/checkout/address" className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 flex-1 text-center">
                      Checkout
                    </Link>
                  </div>
                </div>
              </div>
          )}
        </div>
      </Layout>
  );
};

export default CartPage;
