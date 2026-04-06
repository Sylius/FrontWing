import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { IconX } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { OrderItem } from "../../types/Order";
import type { Product } from "../../types/Product";
import { formatPrice } from "../../utils/price";

interface CartVariant {
  product: string;
  optionValues?: string[];
  code?: string;
}

interface ProductRowProps {
  orderItem: OrderItem;
  onRemove: (id: number) => void;
  onUpdate: (id: number, quantity: number) => void;
}

const ProductRow: React.FC<ProductRowProps> = ({ orderItem, onRemove, onUpdate }) => {
  const [localQuantity, setLocalQuantity] = useState<string>(orderItem.quantity?.toString() || "1");

  const fetchVariant = async (): Promise<CartVariant> => {
    const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}${orderItem.variant}`);
    if (!response.ok) {
      throw new Error("Problem loading variant");
    }

    return await response.json();
  };

  const { data: variant } = useQuery<CartVariant, Error>({
    queryKey: ["variant", orderItem.id],
    queryFn: fetchVariant,
  });

  const fetchProduct = async (): Promise<Product> => {
    const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}${variant!.product}`);
    if (!response.ok) {
      throw new Error("Problem loading product");
    }

    return await response.json();
  };

  const { data: product } = useQuery<Product, Error>({
    queryKey: ["product", orderItem.id],
    queryFn: fetchProduct,
    enabled: !!variant?.product,
  });

  const { data: optionLabels } = useQuery<string[], Error>({
    queryKey: ["optionLabels", orderItem.id],
    queryFn: async () => {
      const API_URL = import.meta.env.VITE_REACT_APP_API_URL;
      const urls: string[] = variant!.optionValues ?? [];
      const values = (await Promise.all(
        urls.map((url: string) => fetch(`${API_URL}${url}`).then((r) => r.json()))
      )) as { value: string; option: string }[];
      const options = (await Promise.all(
        values.map((v) => fetch(`${API_URL}${v.option}`).then((r) => r.json()))
      )) as { name: string }[];
      return values.map((v, i) => `${options[i].name}: ${v.value}`);
    },
    enabled: !!variant?.optionValues?.length,
  });

  return (
    <TableRow>
      <TableCell className="py-3">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => orderItem.id !== undefined && onRemove(orderItem.id)}
        >
          <IconX stroke={2} />
        </Button>
      </TableCell>
      <TableCell className="py-3">
        <div className="flex items-center gap-4">
          <div style={{ width: "6rem" }}>
            <div className="bg-muted overflow-auto rounded-xl" style={{ aspectRatio: "3/4" }}>
              {product?.images?.[0]?.path && (
                <img
                  className="h-auto h-full w-full max-w-full object-cover"
                  src={product.images[0].path}
                  alt={variant?.code}
                />
              )}
            </div>
          </div>
          <div>
            <div className="text-base font-semibold">
              {product?.code ? (
                <>
                  <Link className="link-reset break-words" to={`/product/${product.code}`}>
                    {orderItem?.productName}
                  </Link>
                </>
              ) : (
                orderItem?.productName
              )}
            </div>
            {optionLabels?.length ? (
              <small className="text-muted-foreground block">{optionLabels.join(", ")}</small>
            ) : null}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground py-3 text-right">
        <span>${formatPrice(orderItem.unitPrice)}</span>
      </TableCell>
      <TableCell className="py-3">
        <div className="mt-3 mb-3">
          <Input
            type="number"
            min={1}
            onChange={(e) => {
              const newQuantity = e.target.value;
              setLocalQuantity(newQuantity);
              const parsedQuantity = parseInt(newQuantity, 10);
              if (!isNaN(parsedQuantity) && parsedQuantity > 0 && orderItem.id !== undefined) {
                onUpdate(orderItem.id, parsedQuantity);
              }
            }}
            value={localQuantity}
          />
        </div>
      </TableCell>
      <TableCell className="py-3 text-right">
        <span>${formatPrice(orderItem.subtotal)}</span>
      </TableCell>
    </TableRow>
  );
};

export default ProductRow;
