import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '~/types/Product';

interface ProductsListProps {
    products: Product[];
    limit?: number;
    name?: string;
}

const ProductsList: React.FC<ProductsListProps> = ({ products, limit = products.length, name }) => {
    const safeProducts = Array.isArray(products) ? products.slice(0, limit) : [];

    return (
        <div className="row">
            {name && <h2 className="mb-5">{name}</h2>}
            {safeProducts.map((product) => (
                <div key={product.id} className="col-12 col-sm-12 col-md-6 col-lg-3 mb-4">
                    <ProductCard product={product} />
                </div>
            ))}
        </div>
    );
};

export default ProductsList;
