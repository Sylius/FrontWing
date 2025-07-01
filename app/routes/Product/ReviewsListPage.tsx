import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '~/layouts/Default';
import Breadcrumbs from '~/components/Breadcrumbs';
import Reviews from '~/components/product/Reviews';
import Skeleton from 'react-loading-skeleton';
import { Product, ProductReview } from '~/types/Product';

const ReviewsListPage: React.FC = () => {
    const API_URL = typeof window !== 'undefined' ? window.ENV?.API_URL : '';
    const { code } = useParams<{ code: string }>();

    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; url: string }[]>([]);
    const [loadedImageMap, setLoadedImageMap] = useState<Record<string, boolean>>({});

    const getImageUrl = (path?: string, filter = 'sylius_original') => {
        if (!path) return '';
        return `${path}?imageFilter=${filter}`;
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`${API_URL}/api/v2/shop/products/${code}`);
                const data: Product = await res.json();
                setProduct(data);

                if (Array.isArray(data.reviews) && data.reviews.length > 0) {
                    const detailed = await Promise.all(
                        data.reviews.map(async (ref: { '@id': string }) => {
                            const res = await fetch(`${API_URL}${ref['@id']}`);
                            return await res.json();
                        })
                    );

                    const sorted = detailed.sort(
                        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );

                    setReviews(sorted);
                }

                const breadcrumbPaths: { label: string; url: string }[] = [
                    { label: 'Home', url: '/' },
                    { label: 'Category', url: '#' },
                ];

                if (data.productTaxons?.length) {
                    const visited = new Set<string>();

                    for (const productTaxonUrl of data.productTaxons) {
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
                }

                breadcrumbPaths.push({ label: data.name, url: `/product/${data.code}` });
                breadcrumbPaths.push({ label: 'Reviews', url: '#' });
                setBreadcrumbs(breadcrumbPaths);
            } catch (err) {
                console.error('Failed to load product or reviews', err);
            } finally {
                setLoading(false);
            }
        };

        if (code) fetchProduct();
    }, [code]);

    return (
        <Layout>
            <div className="container mt-4 mb-5">
                <Breadcrumbs paths={breadcrumbs} />
                <div className="row">
                    <div className="col-12 col-md-5 col-lg-4">
                        {loading || !product ? (
                            <Skeleton height={400} />
                        ) : (
                            <div className="overflow-hidden bg-light rounded-3">
                                <img
                                    src={
                                        loadedImageMap[product.images?.[0]?.path ?? '']
                                            ? getImageUrl(product.images?.[0]?.path, 'sylius_original')
                                            : getImageUrl(product.images?.[0]?.path, 'sylius_shop_product_small_thumbnail')
                                    }
                                    alt={product.name}
                                    loading="lazy"
                                    className={`img-fluid w-100 h-auto ${
                                        loadedImageMap[product.images?.[0]?.path ?? '']
                                            ? ''
                                            : 'product-image-blurred'
                                    }`}
                                    onLoad={() =>
                                        setLoadedImageMap((prev) => ({
                                            ...prev,
                                            [product.images?.[0]?.path ?? '']: true,
                                        }))
                                    }
                                />
                            </div>
                        )}
                    </div>

                    <div className="col-12 col-md-7 col-lg-8">
                        {loading ? (
                            <>
                                <Skeleton height={30} width={150} className="mb-2" />
                                <Skeleton height={20} width={100} className="mb-4" />
                                <Skeleton height={40} count={5} className="mb-3" />
                            </>
                        ) : (
                            <>
                                <div className="d-sm-flex gap-3">
                                    <div className="flex-grow-1 mb-3">
                                        <h1>Reviews</h1>
                                        <div>{reviews.length} vote{reviews.length !== 1 && 's'}</div>
                                    </div>
                                    <div className="mb-3">
                                        <a href={`/product/${code}/review/new`} className="btn btn-primary">
                                            Add your review
                                        </a>
                                    </div>
                                </div>

                                <Reviews reviews={reviews} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ReviewsListPage;
