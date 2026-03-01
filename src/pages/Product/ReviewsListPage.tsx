import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../layouts/Default';
import Breadcrumbs from '../../components/Breadcrumbs';
import ProductCard from '../../components/ProductCard';
import Reviews from '../../components/product/Reviews';
import { Product, ProductReview } from '../../types/Product';
import Skeleton from 'react-loading-skeleton';

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const ReviewsListPage: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; url: string }[]>([]);

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

                    const sorted = detailed.sort((a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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

                <div className="flex flex-wrap -mx-4">
                    <div className="w-full md:w-5/12 lg:w-4/12 px-4">
                        {loading ? (
                            <Skeleton height={400} />
                        ) : (
                            product && <ProductCard product={product} />
                        )}
                    </div>

                    <div className="w-full md:w-7/12 lg:w-8/12 px-4">
                        {loading ? (
                            <>
                                <Skeleton height={30} width={150} className="mb-2" />
                                <Skeleton height={20} width={100} className="mb-4" />
                                <Skeleton height={40} count={5} className="mb-3" />
                            </>
                        ) : (
                            <>
                                <div className="sm:flex gap-3">
                                    <div className="flex-1 mb-3">
                                        <h1>Reviews</h1>
                                        <div>{reviews.length} vote{reviews.length !== 1 && 's'}</div>
                                    </div>
                                    <div className="mb-3">
                                        <a href={`/product/${code}/review/new`} className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">
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
