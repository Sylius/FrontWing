import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types/Product';
import { formatPrice } from '../utils/price';
import Skeleton from 'react-loading-skeleton';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [variant, setVariant] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const fetchVariant = async () => {
      try {
        if (!product.variants.length) return;
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}${product.variants[0]}`
        );
        const data = await response.json();
        setVariant(data);
      } catch (error) {
        console.error('Błąd ładowania wariantu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVariant();
  }, [product]);

  return (
    <div>
      <Link to={`/product/${product.code}`} className="link-reset">
        <div className="mb-4">
          <div
            className="bg-light rounded-3"
            style={{ aspectRatio: '3 / 4', overflow: 'hidden' }}
          >
            {loading ? (
              <Skeleton
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            ) : (
              <img
                src={product.images[0]?.path}
                alt={product.name}
                className="img-fluid w-100 h-100 object-fit-cover"
              />
            )}
          </div>
        </div>
        <div className="h6 text-break">
          {loading ? <Skeleton width={120} /> : product.name}
        </div>
      </Link>
      <div>
        {loading ? (
          <Skeleton width={80} height={20} />
        ) : variant?.price ? (
          <span>${formatPrice(variant.price)}</span>
        ) : (
          <span>Brak ceny</span>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
