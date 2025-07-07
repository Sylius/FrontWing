import React, {
    useState,
    useMemo,
    useEffect,
    useCallback,
} from 'react';
import { useParams, useNavigationType } from '@remix-run/react';
import { useOrder } from '~/context/OrderContext';
import { useFlashMessages } from '~/context/FlashMessagesContext';
import Layout from '~/layouts/Default';
import Breadcrumbs from '~/components/Breadcrumbs';
import BootstrapAccordion from '~/components/Accordion';
import Skeleton from 'react-loading-skeleton';
import ReviewList from '~/components/product/Reviews';
import ReviewSummary from '~/components/product/ReviewSummary';
import AssociationsSection from '~/components/product/AssociationsSection';
import ProductLightbox from '~/components/product/ProductLightbox';
import ProductGallery from '~/components/product/ProductGallery';

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
    const navigationType = useNavigationType();
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

    const getImageUrl = useCallback((path?: string, filter = 'sylius_original') => {
        if (!path) return '';
        return `${path}?imageFilter=${filter}`;
    }, []);

    const [activeImage, setActiveImage] = useState(() => product.images?.[0]?.path ?? null);
    const [loadedFullImageMap, setLoadedFullImageMap] = useState<Record<string, boolean>>({});
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [isAddToCartLoading, setIsAddToCartLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [loadedAssociations, setLoadedAssociations] = useState<{ title: string; products: Product[] }[]>([]);
    const [associationsLoading, setAssociationsLoading] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setLoadedAssociations(associations.slice(0, 5));
            setAssociationsLoading(false);
        }, 500);
        return () => clearTimeout(timeout);
    }, [associations]);

    useEffect(() => {
        const path = product.images?.[0]?.path ?? null;
        setActiveImage(path);
        if (path) {
            const img = new Image();
            img.src = getImageUrl(path, 'sylius_original');
            img.onload = () => setLoadedFullImageMap((prev) => ({ ...prev, [path]: true }));
        }
    }, [product.code, getImageUrl]);

    useEffect(() => {
        if (navigationType === 'PUSH') {
            if ('scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'manual';
            }
            const timeout = setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'instant' });
            }, 50);
            return () => {
                clearTimeout(timeout);
                if ('scrollRestoration' in window.history) {
                    window.history.scrollRestoration = 'auto';
                }
            };
        }
    }, [navigationType]);

    const currentVariant: ProductVariantDetails | null = useMemo(() => {
        const selectedKeys = Object.values(selectedValues).sort().join('|');
        return (
            variants.find((v) => {
                const variantKeys = (v.optionValues ?? []).map((ov) => ov.code).sort().join('|');
                return variantKeys === selectedKeys;
            }) ?? variant
        );
    }, [selectedValues, variants, variant]);

    const handleOptionChange = useCallback((opt: string, val: string) => {
        setSelectedValues((prev) => ({ ...prev, [opt]: val }));
    }, []);

    const handleAddToCart = useCallback(async () => {
        if (!currentVariant || !orderToken) return;
        setIsAddToCartLoading(true);
        try {
            const resp = await fetch(`${API_URL}/api/v2/shop/orders/${orderToken}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productVariant: currentVariant.code, quantity }),
            });
            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`add to cart failed: ${text}`);
            }
            fetchOrder();
            addMessage('success', 'Product added to cart');
        } catch (e: any) {
            console.error(e);
            addMessage('error', e?.message ?? 'Failed to add product to cart');
        } finally {
            setIsAddToCartLoading(false);
        }
    }, [API_URL, orderToken, currentVariant, quantity, fetchOrder, addMessage]);

    const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; url: string }[] | null>(null);

    useEffect(() => {
        if (!API_URL) return;

        const buildBreadcrumbs = async () => {
            const breadcrumbPaths: { label: string; url: string }[] = [
                { label: 'Home', url: '/' },
                { label: 'Category', url: '#' },
            ];

            const visited = new Set<string>();

            for (const productTaxonUrl of product.productTaxons ?? []) {
                const taxonRes = await fetch(`${API_URL}${productTaxonUrl}`);
                const taxonData = await taxonRes.json();
                const taxon = await fetch(`${API_URL}${taxonData.taxon}`).then((r) => r.json());

                const parents: { name: string; code: string }[] = [];

                if (taxon.parent) {
                    const parentRes = await fetch(`${API_URL}${taxon.parent}`);
                    const parent = await parentRes.json();
                    parents.push({ name: parent.name, code: parent.code });
                }

                parents.push({ name: taxon.name, code: taxon.code });

                for (const p of parents) {
                    if (!visited.has(p.code)) {
                        visited.add(p.code);
                        breadcrumbPaths.push({ label: p.name, url: `/${p.code}` });
                    }
                }
            }

            breadcrumbPaths.push({ label: product.name, url: `/product/${product.code}` });
            setBreadcrumbs(breadcrumbPaths);
        };

        buildBreadcrumbs();
    }, [product.productTaxons, product.code, product.name, API_URL]);

    const accordionItems = useMemo(() => [
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
                <div className="alert alert-info">
                    <div className="fw-bold">Info</div>There are no reviews
                </div>
            ),
        },
    ], [product.description, attributes, reviews, code]);

    const lightboxSlides = useMemo(() => product?.images?.map((img) => ({ src: getImageUrl(img.path) })) ?? [], [product.images, getImageUrl]);
    const lightboxIndex = useMemo(() => product?.images?.findIndex((img) => img.path === activeImage) ?? 0, [product.images, activeImage]);

    return (
        <Layout>
            <div className="container mt-4 mb-5">
                {breadcrumbs ? <Breadcrumbs paths={breadcrumbs} /> : <Skeleton width={250} height={24} className="mb-4" />}
                <div className="row g-3 g-lg-5 mb-6">
                    <div className="col-12 col-lg-7 col-xl-8">
                        <ProductGallery
                            images={product.images}
                            activeImage={activeImage}
                            onChange={setActiveImage}
                            onOpenLightbox={() => setLightboxOpen(true)}
                            getImageUrl={getImageUrl}
                        />
                        <BootstrapAccordion items={accordionItems} />
                    </div>
                    <div className="col-12 col-lg-5 col-xl-4 order-lg-1">
                        <div className="sticky-top pt-2">
                            <h1 className="h2 text-wrap mb-4">{product?.name}</h1>
                            <ReviewSummary reviews={reviews} productCode={product.code} allReviewCount={reviews.length} />
                            <div className="fs-3 mb-3">
                                {currentVariant?.price != null ? `$${(currentVariant.price / 100).toFixed(2)}` : 'No price available'}
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
            <ProductLightbox
                open={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                slides={lightboxSlides}
                index={lightboxIndex}
            />
            <AssociationsSection associations={loadedAssociations} loading={associationsLoading} />
        </Layout>
    );
};

export default ProductPage;
