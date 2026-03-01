import { TableCell, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Link } from "react-router-dom";
import { OrderItem } from "../../types/Order";
import type { Product } from "../../types/Product";
import { formatPrice } from "../../utils/price";

interface OrderVariant {
  product: string;
  code?: string;
  options?: string;
}

interface ProductRowProps {
  orderItem: OrderItem;
}

const ProductRow: React.FC<ProductRowProps> = ({ orderItem }) => {
  const fetchVariant = async (): Promise<OrderVariant> => {
    const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}${orderItem.variant}`);
    if (!response.ok) {
      throw new Error("Problem loading variant");
    }

    const data = await response.json();

    return data["hydra:member"] || data;
  };

  const { data: variant } = useQuery<OrderVariant, Error>({
    queryKey: ["variant", orderItem.id],
    queryFn: fetchVariant,
  });

  const fetchProduct = async (): Promise<Product> => {
    const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}${variant!.product}`);
    if (!response.ok) {
      throw new Error("Problem loading product");
    }

    const data = await response.json();

    return data["hydra:member"] || data;
  };

  const { data: product } = useQuery<Product, Error>({
    queryKey: [orderItem.id],
    queryFn: fetchProduct,
  });

  return (
    <TableRow>
      <TableCell className="py-3">
        <div className="flex items-center gap-4">
          <div style={{ width: "6rem" }}>
            <div className="bg-muted overflow-auto rounded-xl" style={{ aspectRatio: "3/4" }}>
              {product?.images[0]?.path && (
                <img
                  className="h-full w-full max-w-full object-cover"
                  src={product?.images[0]?.path}
                  alt={variant?.code}
                />
              )}
            </div>
          </div>
          <div>
            <div className="text-base font-semibold">
              {product?.code ? (
                <Link className="link-reset wrap-break-words" to={`/product/${product.code}`}>
                  {orderItem?.productName}
                </Link>
              ) : (
                orderItem?.productName
              )}
            </div>

            <small className="text-muted-foreground">{variant?.code}</small>
            <small className="text-muted-foreground block">{variant?.options}</small>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground text-right">
        <span>${formatPrice(orderItem.unitPrice)}</span>
      </TableCell>

      <TableCell className="text-right">
        <span>{orderItem.quantity}</span>
      </TableCell>

      <TableCell className="text-right">
        <span>${formatPrice(orderItem.subtotal)}</span>
      </TableCell>
    </TableRow>
  );
};

export default ProductRow;
