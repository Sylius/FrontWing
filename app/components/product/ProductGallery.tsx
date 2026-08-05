import React from 'react';
import { useTranslation } from 'react-i18next';
import Skeleton from 'react-loading-skeleton';
import { Image } from '~/types/Product';

interface Props {
    images: Image[];
    activeImage: string | null;
    onChange: (newImage: string) => void;
    onOpenLightbox: () => void;
    getImageUrl: (path?: string, filter?: string) => string;
}

const ProductGallery: React.FC<Props> = ({ images, activeImage, onChange, onOpenLightbox, getImageUrl }) => {
    const { t } = useTranslation('product');
    const mainImage = images.find((img) => img.path === activeImage) ?? images[0];

    if (!mainImage) {
        return <Skeleton height={400} />;
    }

    return (
        <div className="row spotlight-group mb-5">
            {images.length > 1 && (
                <div className="col-auto d-none d-lg-block">
                    <div className="product-thumbnails d-flex flex-column overflow-auto">
                        {images.map((img) => (
                            <button
                                key={img.id}
                                onClick={() => onChange(img.path)}
                                className={`border-0 p-0 bg-transparent rounded overflow-hidden ${
                                    activeImage === img.path ? 'opacity-100' : 'opacity-50'
                                }`}
                            >
                                <img
                                    src={getImageUrl(img.path, 'sylius_shop_product_small_thumbnail')}
                                    alt={t('gallery.thumbnailAlt')}
                                    className="w-100 h-100 object-fit-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <div className="col pe-lg-5 pe-xxl-5">
                <div
                    className="product-main-image-wrapper overflow-hidden bg-light rounded-3"
                    onClick={onOpenLightbox}
                >
                    <img
                        src={getImageUrl(mainImage.path, 'sylius_shop_product_original')}
                        alt={t('gallery.mainAlt')}
                        loading="lazy"
                        className="img-fluid w-100 h-100 object-fit-cover"
                    />
                </div>
            </div>
        </div>
    );
};

export default ProductGallery;
