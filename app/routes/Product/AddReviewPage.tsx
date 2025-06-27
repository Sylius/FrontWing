import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductCard from '~/components/ProductCard';
import { useFlashMessages } from '~/context/FlashMessagesContext';
import Breadcrumbs from '~/components/Breadcrumbs';
import Layout from '~/layouts/Default';
import Skeleton from 'react-loading-skeleton';
import { Product } from '~/types/Product';
import { IconStar } from '@tabler/icons-react';

const AddReviewPage: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const { addMessage } = useFlashMessages();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; url: string }[]>([]);
    const [loadedImageMap, setLoadedImageMap] = useState<Record<string, boolean>>({});

    const [title, setTitle] = useState('');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [email, setEmail] = useState('');

    const API_URL = typeof window !== 'undefined' ? window.ENV?.API_URL : '';

    const getImageUrl = (path?: string, filter = 'sylius_original') => {
        if (!path) return '';
        return `${path}?imageFilter=${filter}`;
    };

    useEffect(() => {
        const fetchProduct = async () => {
            if (!API_URL || !code) return;

            try {
                const res = await fetch(`${API_URL}/api/v2/shop/products/${code}`);
                const data: Product = await res.json();
                setProduct(data);

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
                breadcrumbPaths.push({ label: 'Reviews', url: `/product/${data.code}/reviews` });
                breadcrumbPaths.push({ label: 'Add', url: '#' });
                setBreadcrumbs(breadcrumbPaths);
            } catch (err) {
                console.error('Error loading product:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [API_URL, code]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!API_URL || !code) return;

        try {
            const res = await fetch(`${API_URL}/api/v2/shop/product-reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    rating,
                    comment,
                    email,
                    product: `/api/v2/shop/products/${code}`,
                }),
            });

            if (!res.ok) throw new Error('Failed to submit review');

            addMessage('success', 'Success — Your review is waiting for the acceptation.');
            navigate(`/product/${code}`);
        } catch (err) {
            console.error('Error submitting review:', err);
            addMessage('error', 'Failed to submit your review');
        }
    };

    return (
        <Layout>
            <div className="container mt-4 mb-5">
                <div className="row">
                    <Breadcrumbs paths={breadcrumbs} />

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
                        <h1>Add Your Review</h1>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label d-block">Rating <span className="text-danger">*</span></label>
                                <div className="d-flex gap-2" role="radiogroup" aria-label="Rating">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <button
                                            type="button"
                                            key={value}
                                            className="border-0 bg-transparent p-0"
                                            onClick={() => setRating(value)}
                                            aria-label={`${value} star`}
                                        >
                                            <IconStar
                                                className="review-stars"
                                                stroke={2}
                                                size={32}
                                                fill={value <= rating ? 'currentColor' : 'none'}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Title <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Comment <span className="text-danger">*</span></label>
                                <textarea
                                    className="form-control"
                                    rows={4}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="form-label">Email <span className="text-danger">*</span></label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary px-4">
                                Add
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AddReviewPage;
