import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { pickupCartClient } from '~/api/order.client';
import Slider, { Settings } from 'react-slick';
import { PrevArrow, NextArrow } from '~/components/Arrow';
import Layout from '~/layouts/Default';
import Breadcrumbs from '~/components/Breadcrumbs';
import BootstrapAccordion from '~/components/Accordion';
import ProductCard from '~/components/ProductCard';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
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

interface Association {
    title: string;
    products: Product[];
}

const getImageUrl = (path?: string, filter = 'sylius_original') => {
    if (!path) return '';
    return `${path}?imageFilter=${filter}`;
};

const AssociationsSection: React.FC<{
    associations: Association[];
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

const ProductPage: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const { orderToken, fetchOrder } = useOrder();
    const { addMessage } = useFlashMessages();

    const [product, setProduct] = useState<ApiProduct | null>(null);
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
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; url: string }[]>([]);
    const [associations, setAssociations] = useState<Association[]>([]);
    const [associationsLoading, setAssociationsLoading] = useState(false);

    const fetchOption = async (url: string): Promise<ProductOption> => {
        const API_URL = window.ENV?.API_URL;

        const res = await fetch(`${API_URL}${url}`);
        const data = await res.json();
        const values: ProductOptionValue[] = await Promise.all(
            data.values.map((v: string) => fetch(`${API_URL}${v}`).then((r) => r.json()))
        );
        return { code: data.code, name: data.name, values };
    };

    const fetchVariantByOptions = async (
        prodCode: string,
        sel: Record<string, string>
    ) => {
        const API_URL = window.ENV?.API_URL;

        const params = Object.entries(sel)
            .map(
                ([opt, val]) =>
                    `optionValues[]=/api/v2/shop/product-options/${opt}/values/${val}`
            )
            .join('&');
        const res = await fetch(
            `${API_URL}/api/v2/shop/product-variants?product=/api/v2/shop/products/${prodCode}&${params}`
        );
        const data = await res.json();
        setVariant(data['hydra:member']?.[0] ?? null);
    };

    const fetchProductAttributes = async (prodCode: string) => {
        const API_URL = window.ENV?.API_URL;

        try {
            const res = await fetch(
                `${API_URL}/api/v2/shop/products/${prodCode}/attributes`
            );
            const data = await res.json();
            setAttributes(data['hydra:member'] ?? []);
        } catch (e) {
            console.error('attributes error', e);
        }
    };

    const fetchProductReviews = async (refs: { '@id': string }[]) => {
        const API_URL = window.ENV?.API_URL;

        setAllReviewCount(refs.length);
        const data: ProductReview[] = await Promise.all(
            refs.map((ref) =>
                fetch(`${API_URL}${ref['@id']}`).then((r) => r.json())
            )
        );
        setReviews(
            data
                .sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
                .slice(0, 5)
        );
    };

    const fetchAssociations = async (urls: string[]) => {
        const API_URL = window.ENV?.API_URL;

        setAssociationsLoading(true);
        try {
            const list = await Promise.all(
                urls.map(async (url) => {
                    const res = await fetch(`${API_URL}${url}`);
                    const { type, associatedProducts } = await res.json();
                    const tRes = await fetch(`${API_URL}${type}`);
                    const { name } = await tRes.json();
                    const prods: Product[] = await Promise.all(
                        associatedProducts.map((pUrl: string) =>
                            fetch(`${API_URL}${pUrl}`).then((r) => r.json())
                        )
                    );
                    return { title: name, products: prods };
                })
            );
            setAssociations(list);
        } catch (e) {
            console.error('associations error', e);
        } finally {
            setAssociationsLoading(false);
        }
    };

    const fetchProduct = async () => {
        const API_URL = window.ENV?.API_URL;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/api/v2/shop/products/${code}`);
            const data: ApiProduct = await res.json();
            setProduct(data);

            const bc = [{ label: 'Home', url: '/' }];
            if (data.productTaxons?.length) {
                const visited = new Set<string>();
                for (const taxonUrl of data.productTaxons) {
                    const tRes = await fetch(`${API_URL}${taxonUrl}`);
                    const tData = await tRes.json();
                    const taxRes = await fetch(`${API_URL}${tData.taxon}`);
                    const tax: { name: string; code: string; parent?: string } =
                        await taxRes.json();
                    const parents: { name: string; code: string }[] = [];
                    if (tax.parent) {
                        const pRes = await fetch(`${API_URL}${tax.parent}`);
                        const parent = await pRes.json();
                        parents.push({ name: parent.name, code: parent.code });
                    }
                    parents.push({ name: tax.name, code: tax.code });
                    parents.forEach((p) => {
                        if (!visited.has(p.code)) {
                            visited.add(p.code);
                            bc.push({ label: p.name, url: `/${p.code}` });
                        }
                    });
                }
            }
            bc.push({ label: data.name, url: `/product/${data.code}` });
            setBreadcrumbs(bc);

            if (data.images?.length) setActiveImage(data.images[0].path);

            if (data.options?.length) {
                const opts = await Promise.all(data.options.map(fetchOption));
                setOptions(opts);
                const sel: Record<string, string> = {};
                opts.forEach((o) => (sel[o.code] = o.values[0]?.code ?? ''));
                setSelectedValues(sel);
                await fetchVariantByOptions(data.code, sel);
            } else if (data.defaultVariant) {
                const vRes = await fetch(`${API_URL}${data.defaultVariant}`);
                setVariant(await vRes.json());
            }

            await fetchProductAttributes(data.code);
            if (data.reviews?.length) await fetchProductReviews(data.reviews);
            if (data.associations?.length) {
                await fetchAssociations(data.associations);
            } else {
                setAssociations([]);
            }
        } catch (e) {
            console.error('product fetch error', e);
            setError('Error while loading product data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (code) fetchProduct();
    }, [code]);

    const handleOptionChange = (opt: string, val: string) => {
        const upd = { ...selectedValues, [opt]: val };
        setSelectedValues(upd);
        if (product) fetchVariantByOptions(product.code, upd);
    };

    const handleAddToCart = async () => {
        const API_URL = window.ENV?.API_URL;

        if (!variant || !orderToken) return;

        setIsAddToCartLoading(true);
        try {
            const resp = await fetch(
                `${API_URL}/api/v2/shop/orders/${orderToken}/items`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productVariant: variant.code, quantity }),
                }
            );
            if (!resp.ok) throw new Error("add to cart failed");
            fetchOrder();
            addMessage("success", "Product added to cart");
        } catch (e) {
            console.error("add to cart error", e);
            addMessage("error", "Failed to add product to cart");
        } finally {
            setIsAddToCartLoading(false);
        }
    };

    const accordionItems = useMemo(() => {
        if (!product) return [];
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
                            <a
                                href={`/product/${code}/review/new`}
                                className="btn btn-success px-4 py-2"
                            >
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
                        <a
                            href={`/product/${code}/review/new`}
                            className="btn btn-primary"
                        >
                            Add your review
                        </a>
                    </>
                ),
            },
        ];
    }, [product, attributes, reviews, allReviewCount, code]);

    const [loadedFullImage, setLoadedFullImage] = useState<string | null>(null);

    const baseImage = activeImage ?? product?.images?.[0]?.path;

    useEffect(() => {
        if (baseImage) {
            setLoadedFullImage(null); // resetujemy miniaturkę
            const full = new Image();
            full.src = getImageUrl(baseImage, 'sylius_original');

            full.onload = () => {
                console.log('✅ Full-size image loaded:', full.src);
                setLoadedFullImage(full.src);
            };

            console.log('🕓 Starting to load full-size image:', full.src);
        }
    }, [baseImage]);

    const lightboxSlides = product?.images?.map((img) => ({ src: getImageUrl(img.path) })) ?? [];
    const lightboxIndex =
        product?.images?.findIndex((img) => img.path === activeImage) ?? 0;

    if (error) return <div className="text-danger text-center">{error}</div>;

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
                                        onLoad={() =>
                                            console.log(
                                                '📷 IMG tag rendered with:',
                                                loadedFullImage ? 'FULL IMAGE' : 'THUMBNAIL'
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                        {!loading && <BootstrapAccordion items={accordionItems}/>}
                    </div>
                    <div className="col-12 col-lg-5 col-xl-4 order-lg-1">
                        <div className="sticky-top pt-2">
                            <h1 className="h2 text-wrap mb-4">{product?.name}</h1>
                            {loading ? (
                                <ReviewSummarySkeleton/>
                            ) : (
                                product && (
                                    <ReviewSummary
                                        reviews={reviews}
                                        productCode={product.code}
                                        allReviewCount={allReviewCount}
                                    />
                                )
                            )}
                            <div className="fs-3 mb-3">
                                {loading ? (
                                    <Skeleton width={100}/>
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
                                        onChange={(e) =>
                                            handleOptionChange(opt.code, e.target.value)
                                        }
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

            <AssociationsSection
                associations={associations}
                loading={associationsLoading}
            />
        </Layout>
    );
};

export default ProductPage;
