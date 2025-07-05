import React from 'react';
import { Link } from 'react-router-dom';
import { ProductVariantDetails, Product } from '~/types/Product';
import { formatPrice } from '~/utils/price';
import Skeleton from 'react-loading-skeleton';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const variant: ProductVariantDetails | undefined = product.defaultVariantData ?? undefined;

    const getImageUrl = (path?: string, filter = 'sylius_shop_product_small_thumbnail') => {
        if (!path) return '';
        return `${path}?imageFilter=${filter}`;
    };

    const image = product.images?.[0]?.path;
    const name = product.name;

    return (
        <div>
            <Link to={`/product/${product.code}`} className="link-reset">
                <div className="mb-4">
                    <div className="bg-light rounded-3" style={{ aspectRatio: '3 / 4', overflow: 'hidden' }}>
                        {image ? (
                            <img
                                src={getImageUrl(image)}
                                alt={name}
                                className="img-fluid w-100 h-100 object-fit-cover"
                                loading="lazy"
                            />
                        ) : (
                            <Skeleton style={{ width: '100%', height: '100%', display: 'block' }} />
                        )}
                    </div>
                </div>
                <div className="h6 text-break">
                    {name || <Skeleton width={120} />}
                </div>
            </Link>
            <div>
                {variant?.price != null ? (
                    <span>${formatPrice(variant.price)}</span>
                ) : (
                    <span>No price</span>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
