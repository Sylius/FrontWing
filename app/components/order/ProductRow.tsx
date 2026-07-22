import { OrderItem } from '../../types/Order';
import { formatPrice } from '../../utils/price';
import { useQuery } from '@tanstack/react-query';
import {Link} from "react-router";
import React from "react";

interface ProductRowProps {
  orderItem: OrderItem;
}

const ProductRow: React.FC<ProductRowProps> = ({ orderItem }) => {
  const fetchVariant = async (): Promise<any> => {
    const response = await fetch(
      `${window.ENV?.API_URL}${orderItem.variant}`
    );
    if (!response.ok) {
      throw new Error('Problem z pobieraniem wariantu');
    }

    const data = await response.json();

    return data['hydra:member'] || data;
  };

  const { data: variant } = useQuery<any, Error>({
    queryKey: ['variant', orderItem.id],
    queryFn: fetchVariant,
  });

  const fetchProduct = async (): Promise<any> => {
    const response = await fetch(
      `${window.ENV?.API_URL}${variant.product}`
    );
    if (!response.ok) {
      throw new Error('Problem z pobieraniem wariantu');
    }

    const data = await response.json();

    return data['hydra:member'] || data;
  };

  const { data: product } = useQuery<any, Error>({
    queryKey: [orderItem.id],
    queryFn: fetchProduct,
  });

  return (
    <tr>
      <td>
        <div className="d-flex align-items-center gap-4">
          <div style={{ width: '6rem' }}>
            <div
              className="overflow-auto bg-light rounded-3"
              style={{ aspectRatio: '3/4' }}
            >
              {product?.images[0]?.path && (
                <img
                  className="img-fluid w-100 h-100 object-fit-cover"
                  src={product?.images[0]?.path}
                  alt={variant.code}
                />
              )}
            </div>
          </div>
          <div>
            <div className="h6">
              {product?.code ? (
                  <Link
                      className="link-reset text-break"
                      to={`/product/${product.code}`}
                  >
                    {orderItem?.productName}
                  </Link>
              ) : (
                  orderItem?.productName
              )}
            </div>

            <small className="text-body-tertiary">{variant?.code}</small>
          </div>
        </div>
      </td>
      <td className="text-black-50 text-end">
        <span>${formatPrice(orderItem.unitPrice)}</span>
      </td>

      <td className={'text-end'}>
        <span>{orderItem.quantity}</span>
      </td>

      <td className="text-end">
        <span>${formatPrice(orderItem.subtotal)}</span>
      </td>
    </tr>
  );
};

export default ProductRow;
