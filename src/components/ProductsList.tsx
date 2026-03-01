import React from 'react';
import { Product } from '../types/Product';
import ProductCard from './ProductCard';

interface ProductsListProps {
    products: Product[];
    limit?: number;
    name?: string;
}

const ProductsList: React.FC<ProductsListProps> = ({ products, limit = products.length, name }) => {
    return (
        <div className="flex flex-wrap -mx-4">
            { name && <h2 className={'mb-5 w-full px-4'}>{ name }</h2> }
            {products.slice(0, limit).map(product => (
                <div key={product.id} className="w-full sm:w-full md:w-1/4 mb-4 px-4">
                    <ProductCard product={product} />
                </div>
            ))}
        </div>
    );
};

export default ProductsList;
