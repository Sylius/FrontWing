import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from '@remix-run/react';
import Slider, { Settings } from 'react-slick';
import { PrevArrow, NextArrow } from '~/components/Arrow';
import Layout from '~/layouts/Default';
import Breadcrumbs from '~/components/Breadcrumbs';
import BootstrapAccordion from '~/components/Accordion';
import ProductCard from '~/components/ProductCard';
import Skeleton from 'react-loading-skeleton';
import { formatPrice } from '~/utils/price';
import { useOrder } from '~/context/OrderContext';
import { useFlashMessages } from '~/context/FlashMessagesContext';
import ReviewList from '~/components/product/Reviews';
import ReviewSummary from '~/components/product/ReviewSummary';
import ReviewSummarySkeleton from '~/components/product/ReviewSummarySkeleton';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import {
    Product,
    ProductVariantDetails,
    ProductOption,
    ProductOptionValue,
    ProductAttribute,
    ProductReview,
} from '~/types/Product';

interface ApiProduct extends Product {
    productTaxons?: string[];
    associations?: string[];
    options?: string[];
    reviews?: { '@id': string }[];
    defaultVariant?: string;
}

interface Props {
    product: ApiProduct;
}

const getImageUrl = (path?: string, filter = 'sylius_original') => {
    if (!path) return '';
    return `${path}?imageFilter=${filter}`;
};

const AssociationsSection: React.FC<{
    associations: { title: string; products: Product[] }[];
    loading: boolean;
}> = ({ associations, loading }) => {
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

const ProductPage: React.FC<Props> = ({ product }) => {
    const { code } = useParams();
    const { orderToken, fetchOrder } = useOrder();
    const { addMessage } = useFlashMessages();

    const [variant, setVariant] = useState<ProductVariantDetails | null>(null);
    const [options, setOptions] = useState<ProductOption[]>([]);
    const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [allReviewCount, setAllReviewCount] = useState(0);
    const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isAddToCartLoading, setIsAddToCartLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; url: string }[]>([]);
    const [associations, setAssociations] = useState<{ title: string; products: Product[] }[]>([]);
    const [associationsLoading, setAssociationsLoading] = useState(false);
    const [loadedFullImage, setLoadedFullImage] = useState<string | null>(null);

    const API_URL = typeof window !== 'undefined' ? window.ENV?.API_URL : '';

    const baseImage = activeImage ?? product?.images?.[0]?.path;

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            setActiveImage(product.images?.[0]?.path ?? null);

            const [variantData, attrData, reviewData, assocData] = await Promise.all([
                product.defaultVariant
                    ? fetch(`${API_URL}${product.defaultVariant}`).then((r) => r.json())
                    : null,
                fetch(`${API_URL}/api/v2/shop/products/${product.code}/attributes`)
                    .then((r) => r.json())
                    .then((d) => d['hydra:member'] ?? []),
                product.reviews?.length
                    ? Promise.all(
                        product.reviews.map((ref) =>
                            fetch(`${API_URL}${ref['@id']}`).then((r) => r.json())
                        )
                    ).then((all) =>
                        all
                            .sort(
                                (a, b) =>
                                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                            )
                            .slice(0, 5)
                    )
                    : [],
                product.associations?.length
                    ? Promise.all(
                        product.associations.map(async (url) => {
                            const assocRes = await fetch(`${API_URL}${url}`);
                            const assoc = await assocRes.json();

                            const assocTypeRes = await fetch(`${API_URL}${assoc.type}`);
                            const assocType = await assocTypeRes.json();

                            const assocProducts: Product[] = await Promise.all(
                                assoc.associatedProducts.map((url: string) =>
                                    fetch(`${API_URL}${url}`).then((r) => r.json())
                                )
                            );

                            return { title: assocType.name, products: assocProducts };
                        })
                    )
                    : [],
            ]);

            setVariant(variantData);
            setAttributes(attrData);
            setReviews(reviewData);
            setAllReviewCount(product.reviews?.length ?? 0);
            setAssociations(assocData);
            setBreadcrumbs([
                { label: 'Home', url: '/' },
                { label: product.name, url: `/product/${product.code}` },
            ]);
            setLoading(false);
        };

        init();
    }, [product]);

    useEffect(() => {
        if (baseImage) {
            setLoadedFullImage(null);
            const full = new Image();
            full.src = getImageUrl(baseImage, 'sylius_original');
            full.onload = () => setLoadedFullImage(full.src);
        }
    }, [baseImage]);

    const handleOptionChange = (opt: string, val: string) => {
        const upd = { ...selectedValues, [opt]: val };
        setSelectedValues(upd);
    };

    const handleAddToCart = async () => {
        if (!variant || !orderToken) return;

        setIsAddToCartLoading(true);
        try {
            const resp = await fetch(
                `${API_URL}/api/v2/shop/orders/${orderToken}/items`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productVariant: variant.code, quantity }),
                }
            );
            if (!resp.ok) throw new Error('add to cart failed');
            fetchOrder();
            addMessage('success', 'Product added to cart');
        } catch {
            addMessage('error', 'Failed to add product to cart');
        } finally {
            setIsAddToCartLoading(false);
        }
    };

    const lightboxSlides = product?.images?.map((img) => ({
        src: getImageUrl(img.path),
    })) ?? [];
    const lightboxIndex =
        product?.images?.findIndex((img) => img.path === activeImage) ?? 0;

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
                title: `Reviews (${allReviewCount})`,
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
    }, [product, attributes, reviews, allReviewCount, code]);

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
                                            loadedFullImage ??
                                            getImageUrl(baseImage, 'sylius_shop_product_small_thumbnail')
                                        }
                                        alt={product?.name}
                                        loading="lazy"
                                        className={`img-fluid w-100 h-100 object-fit-cover ${
                                            !loadedFullImage ? 'product-image-blurred' : ''
                                        }`}
                                    />
                                </div>
                            </div>
                        </div>
                        {!loading && <BootstrapAccordion items={accordionItems} />}
                    </div>
                    <div className="col-12 col-lg-5 col-xl-4 order-lg-1">
                        <div className="sticky-top pt-2">
                            <h1 className="h2 text-wrap mb-4">{product?.name}</h1>
                            {loading ? (
                                <ReviewSummarySkeleton />
                            ) : (
                                <ReviewSummary
                                    reviews={reviews}
                                    productCode={product.code}
                                    allReviewCount={allReviewCount}
                                />
                            )}
                            <div className="fs-3 mb-3">
                                {loading ? (
                                    <Skeleton width={100} />
                                ) : variant?.price != null ? (
                                    `$${formatPrice(variant.price)}`
                                ) : (
                                    'No price available'
                                )}
                            </div>
                            {options.map((opt) => (
                                <div className="mb-3" key={opt.code}>
                                    <label className="form-label">{opt.name}</label>
                                    <select
                                        className="form-select"
                                        value={selectedValues[opt.code] ?? ''}
                                        onChange={(e) => handleOptionChange(opt.code, e.target.value)}
                                    >
                                        {opt.values.map((v) => (
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
                                    disabled={isAddToCartLoading || loading}
                                >
                                    {isAddToCartLoading ? 'Adding...' : 'Add to cart'}
                                </button>
                            </div>
                            <div className="mb-3">
                                {product?.shortDescription ?? 'No short description'}
                            </div>
                            <small className="text-body-tertiary">
                                {product?.name.replace(/\s+/g, '_')}
                            </small>
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
            <AssociationsSection associations={associations} loading={associationsLoading} />
        </Layout>
    );
};

export default ProductPage;
