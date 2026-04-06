import React from "react";
import { Product } from "../types/Product";
import ProductCard from "./ProductCard";

interface ProductsListProps {
  products: Product[];
  limit?: number;
  name?: string;
}

const ProductsList: React.FC<ProductsListProps> = ({ products, limit = products.length, name }) => {
  return (
    <div className="-mx-4 flex flex-wrap">
      {name && <h2 className={"mb-5 w-full px-4"}>{name}</h2>}
      {products.slice(0, limit).map((product) => (
        <div key={product.id} className="mb-4 w-full px-4 sm:w-full md:w-1/4">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};

export default ProductsList;
