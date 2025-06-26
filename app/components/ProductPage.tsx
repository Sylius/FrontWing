// components/ProductPage.tsx
import React, { useState, useMemo } from 'react';
import { useParams } from '@remix-run/react';
import { useOrder } from '~/context/OrderContext';
import { useFlashMessages } from '~/context/FlashMessagesContext';
import Layout from '~/layouts/Default';
import Breadcrumbs from '~/components/Breadcrumbs';
import BootstrapAccordion from '~/components/Accordion';
import ProductCard from '~/components/ProductCard';
import Skeleton from 'react-loading-skeleton';
import ReviewList from '~/components/product/Reviews';
import ReviewSummary from '~/components/product/ReviewSummary';
import Lightbox from 'yet-another-react-lightbox';
import { PrevArrow, NextArrow } from '~/components/Arrow';
import Slider from '~/components/ClientOnlySlider';
import type { Settings } from 'react-slick';

import 'yet-another-react-lightbox/styles.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import {
    Product,
    ProductVariantDetails,
    ProductOption,
    ProductAttribute,
    ProductReview,
} from '~/types/Product';

interface Props {
    product: Product;
    variant: ProductVariantDetails | null;
    options: ProductOption[];
    variants: ProductVariantDetails[];
    attributes: ProductAttribute[];
    reviews: ProductReview[];
    associations: { title: string; products: Product[] }[];
}

const getImageUrl = (path?: string, filter = 'sylius_original') => {
    if (!path) return '';
    return `${path}?imageFilter=${filter}`;
};

const AssociationsSection: React.FC<{
    associations: { title: string; products: Product[] }[];
    loading: boolean;
}> = ({ associations, loading }) => {
    if (typeof window === 'undefined') return null;

    if (loading) {
        return (
            <div className="container mb-5 position-relative">
                <Skeleton width={200} height={24} className="mb-3" />
                <div className="d-flex">
                    {Array(4)
                        .fill(0)
                        .map((_, i) => (
                            <div key={i} className="px-2" style={{ flex: '1 0 auto' }}>
                                <Skeleton height={300} />
                            </div>
                        ))}
                </div>
            </div>
        );
    }

    const settings: Settings = {
        infinite: true,
        slidesToShow: 5,
        slidesToScroll: 1,
        arrows: true,
        prevArrow: <PrevArrow />,
        nextArrow: <NextArrow />,
        responsive: [
            { breakpoint: 1400, settings: { slidesToShow: 4 } },
            { breakpoint: 1200, settings: { slidesToShow: 3 } },
            { breakpoint: 768, settings: { slidesToShow: 2 } },
            { breakpoint: 576, settings: { slidesToShow: 1 } },
        ],
    };

    return (
        <>
            {associations.map(({ title, products }) => (
                <div key={title} className="container mb-5 position-relative">
                    <h2 className="h4 mb-3">{title}</h2>
                    <Slider {...settings}>
                        {products.map((p) => (
                            <div key={p.code} className="px-2">
                                <ProductCard product={p} />
                            </div>
                        ))}
                    </Slider>
                </div>
            ))}
        </>
    );
};

const ProductPage: React.FC<Props> = ({
                                          product,
                                          variant,
                                          options,
                                          variants,
                                          attributes,
                                          reviews,
                                          associations,
                                      }) => {
    const { code } = useParams();
    const { orderToken, fetchOrder } = useOrder();
    const { addMessage } = useFlashMessages();

    const API_URL = typeof window !== 'undefined' ? window.ENV?.API_URL : '';

    const [selectedValues, setSelectedValues] = useState<Record<string, string>>(() => {
        const firstVariant = variants[0];
        const prefilled: Record<string, string> = {};
        firstVariant.optionValues?.forEach((ov) => {
            if (ov.option?.code) {
                prefilled[ov.option.code] = ov.code;
            }
        });
        return prefilled;
    });

    const [activeImage, setActiveImage] = useState<string | null>(product.images?.[0]?.path ?? null);
    const [loadedFullImageMap, setLoadedFullImageMap] = useState<Record<string, boolean>>({});
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [isAddToCartLoading, setIsAddToCartLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const currentVariant: ProductVariantDetails | null = useMemo(() => {
        const selectedKeys = Object.values(selectedValues).sort().join('|');
        return (
            variants.find((v) => {
                const variantKeys = (v.optionValues ?? []).map((ov) => ov.code).sort().join('|');
                return variantKeys === selectedKeys;
            }) ?? variant
        );
    }, [selectedValues, variants, variant]);

    const handleOptionChange = (opt: string, val: string) => {
        setSelectedValues((prev) => ({ ...prev, [opt]: val }));
    };

    const handleAddToCart = async () => {
        if (!currentVariant || !orderToken) return;
        setIsAddToCartLoading(true);
        try {
            const resp = await fetch(`${API_URL}/api/v2/shop/orders/${orderToken}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productVariant: currentVariant.code, quantity }),
            });
            if (!resp.ok) throw new Error('add to cart failed');
            fetchOrder();
            addMessage('success', 'Product added to cart');
        } catch {
            addMessage('error', 'Failed to add product to cart');
        } finally {
            setIsAddToCartLoading(false);
        }
    };

    const lightboxSlides =
        product?.images?.map((img) => ({
            src: getImageUrl(img.path),
        })) ?? [];

    const lightboxIndex = product?.images?.findIndex((img) => img.path === activeImage) ?? 0;

    const breadcrumbs = useMemo(
        () => [
            { label: 'Home', url: '/' },
            { label: product.name, url: `/product/${product.code}` },
        ],
        [product]
    );

    const accordionItems = useMemo(() => {
        return [
            { title: 'Details', content: <p>{product.description}</p> },
            {
                title: 'Attributes',
                content: attributes.length ? (
                    <table className="table table-lg table-list">
                        <tbody>
                        {attributes.map((a) => (
                            <tr key={a.id}>
                                <th className="fw-bold py-3 ps-0">{a.name}</th>
                                <td className="py-3">{a.value}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No attributes available.</p>
                ),
            },
            {
                title: `Reviews (${reviews.length})`,
                content: reviews.length ? (
                    <>
                        <ReviewList reviews={reviews} />
                        <div className="d-flex flex-wrap gap-3">
                            <a href={`/product/${code}/review/new`} className="btn btn-success px-4 py-2">
                                Add your review
                            </a>
                            <a href={`/product/${code}/reviews`} className="btn btn-link">
                                View more
                            </a>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="alert alert-info">
                            <div className="fw-bold">Info</div>There are no reviews
                        </div>
                        <a href={`/product/${code}/review/new`} className="btn btn-primary">
                            Add your review
                        </a>
                    </>
                ),
            },
        ];
    }, [product, attributes, reviews, code]);

    return (
        <Layout>
            <div className="container mt-4 mb-5">
                <Breadcrumbs paths={breadcrumbs} />
                <div className="row g-3 g-lg-5 mb-6">
                    <div className="col-12 col-lg-7 col-xl-8">
                        <div className="row spotlight-group mb-5">
                            {product && product.images.length > 1 && (
                                <div className="col-auto d-none d-lg-block">
                                    <div className="product-thumbnails d-flex flex-column overflow-auto">
                                        {product.images.map((img) => (
                                            <button
                                                key={img.id}
                                                onClick={() => setActiveImage(img.path)}
                                                className={`border-0 p-0 bg-transparent rounded overflow-hidden ${
                                                    activeImage === img.path ? 'opacity-100' : 'opacity-50'
                                                }`}
                                            >
                                                <img
                                                    src={getImageUrl(img.path, 'sylius_shop_product_small_thumbnail')}
                                                    alt="thumbnail"
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
                                    onClick={() => setLightboxOpen(true)}
                                >
                                    <img
                                        src={
                                            loadedFullImageMap[activeImage ?? ''] === true
                                                ? getImageUrl(activeImage, 'sylius_original')
                                                : getImageUrl(activeImage, 'sylius_shop_product_small_thumbnail')
                                        }
                                        alt={product?.name}
                                        loading="lazy"
                                        onLoad={() =>
                                            setLoadedFullImageMap((prev) => ({
                                                ...prev,
                                                [activeImage ?? '']: true,
                                            }))
                                        }
                                        className={`img-fluid w-100 h-100 object-fit-cover ${
                                            loadedFullImageMap[activeImage ?? ''] ? '' : 'product-image-blurred'
                                        }`}
                                    />
                                </div>
                            </div>
                        </div>
                        <BootstrapAccordion items={accordionItems} />
                    </div>
                    <div className="col-12 col-lg-5 col-xl-4 order-lg-1">
                        <div className="sticky-top pt-2">
                            <h1 className="h2 text-wrap mb-4">{product?.name}</h1>
                            <ReviewSummary
                                reviews={reviews}
                                productCode={product.code}
                                allReviewCount={reviews.length}
                            />
                            <div className="fs-3 mb-3">
                                {currentVariant?.price != null
                                    ? `$${(currentVariant.price / 100).toFixed(2)}`
                                    : 'No price available'}
                            </div>
                            {options.map((opt) => (
                                <div className="mb-3" key={opt.code}>
                                    <label className="form-label">{opt.name}</label>
                                    <select
                                        className="form-select"
                                        value={selectedValues[opt.code] ?? ''}
                                        onChange={(e) => handleOptionChange(opt.code, e.target.value)}
                                    >
                                        {(opt.values ?? []).map((v) => (
                                            <option key={v.code} value={v.code}>
                                                {v.value}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                            <div className="my-4">
                                <label className="form-label">Quantity</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={quantity}
                                    min={1}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                />
                                <button
                                    className="btn btn-success px-4 py-2 mt-3"
                                    onClick={handleAddToCart}
                                    disabled={isAddToCartLoading}
                                >
                                    {isAddToCartLoading ? 'Adding...' : 'Add to cart'}
                                </button>
                            </div>
                            <div className="mb-3">{product?.shortDescription ?? 'No short description'}</div>
                            <small className="text-body-tertiary">{product?.name.replace(/\s+/g, '_')}</small>
                        </div>
                    </div>
                </div>
            </div>
            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                slides={lightboxSlides}
                index={lightboxIndex}
            />
            <AssociationsSection associations={associations} loading={false} />
        </Layout>
    );
};

export default ProductPage;
