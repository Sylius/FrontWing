import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import Layout from '~/layouts/Default';
import { Product } from '~/types/Product';
import Breadcrumbs from '~/components/Breadcrumbs';
import ProductCard from '~/components/ProductCard';
import Skeleton from 'react-loading-skeleton';
import ProductToolbar from '~/components/taxons/ProductToolbar';

interface TaxonDetails {
    id: number;
    name: string;
    description: string;
    code: string;
    level: number;
    parent?: string;
    children: { name: string; code: string }[];
}

const ProductList: React.FC = () => {
    const { code, parentCode, childCode } = useParams<{
        code?: string;
        parentCode?: string;
        childCode?: string;
    }>();

    const taxonCode = childCode || parentCode || code;

    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [taxon, setTaxon] = useState<TaxonDetails | null>(null);
    const [breadcrumbPath, setBreadcrumbPath] = useState<{ name: string; code: string }[]>([]);

    const API = typeof window !== 'undefined' ? window.ENV?.API_URL : process.env.API_URL;

    const fetchProducts = async (
        page: number,
        code: string,
        queryParams: string
    ): Promise<Product[]> => {
        const url = `${API}/api/v2/shop/products?itemsPerPage=9&page=${page}&productTaxons.taxon.code=${code}${
            queryParams ? '&' + queryParams : ''
        }`;
        const response = await fetch(url);
        const data = await response.json();
        const totalItems = data['hydra:totalItems'] || 0;
        const fetchedProducts: Product[] = data['hydra:member'] || [];
        setHasMore(page * 9 < totalItems);
        return fetchedProducts;
    };

    const fetchTaxon = async (code: string): Promise<TaxonDetails | null> => {
        const res = await fetch(`${API}/api/v2/shop/taxons/${code}`);
        if (!res.ok) return null;
        const data = await res.json();

        const childUrls: string[] = Array.isArray(data.children) ? data.children : [];
        const children: { name: string; code: string }[] = [];

        for (const childUrl of childUrls) {
            const res = await fetch(`${API}${childUrl}`);
            if (res.ok) {
                const json = await res.json();
                children.push({ name: json.name, code: json.code });
            }
        }

        return {
            id: data.id,
            name: data.name,
            description: data.description,
            code: data.code,
            level: data.level,
            parent: data.parent ? data.parent.split('/').pop() : undefined,
            children,
        };
    };

    const fetchBreadcrumbs = async (
        code: string
    ): Promise<{ name: string; code: string }[]> => {
        const res = await fetch(`${API}/api/v2/shop/taxon-tree/${code}/path`);
        const json = await res.json();
        return (
            json['hydra:member']?.map((t: any) => ({
                name: t.name,
                code: t.code,
            })) ?? []
        );
    };

    useEffect(() => {
        const loadData = async () => {
            if (!taxonCode) {
                setError('Missing taxon code');
                return;
            }
            setLoading(true);
            try {
                const [productsData, taxonData, path] = await Promise.all([
                    fetchProducts(1, taxonCode, searchParams.toString()),
                    fetchTaxon(taxonCode),
                    fetchBreadcrumbs(taxonCode),
                ]);
                setProducts(productsData);
                setTaxon(taxonData);
                setBreadcrumbPath(path);
                setCurrentPage(1);
                console.log('[taxon]', taxonData);
                console.log('[breadcrumbPath]', path);
            } catch (err) {
                setError('Failed to load category');
                console.error('[load error]', err);
            } finally {
                setLoading(false);
            }
        };

        loadData().catch(console.error);
    }, [taxonCode, searchParams]);

    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore || !taxonCode) return;
        setLoadingMore(true);
        const nextPage = currentPage + 1;
        try {
            const newProducts = await fetchProducts(
                nextPage,
                taxonCode,
                searchParams.toString()
            );
            setProducts((prev) => [...prev, ...newProducts]);
            setCurrentPage(nextPage);
        } catch (err) {
            console.error('Error loading more products', err);
        } finally {
            setLoadingMore(false);
        }
    }, [currentPage, taxonCode, hasMore, loadingMore, searchParams]);

    useEffect(() => {
        const onScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            if (scrollHeight - scrollTop - clientHeight < 300) {
                loadMore().catch(console.error);
            }
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [loadMore]);

    if (error)
        return <div className="text-danger text-center">{error}</div>;

    const breadcrumbs = [
        { label: 'Home', url: '/' },
        { label: 'Category', url: '' },
        ...breadcrumbPath.map((p) => ({
            label: p.name,
            url: `/category/${p.code}`,
        })),
    ];

    const isInLeaf =
        breadcrumbPath.length > 1 &&
        Array.isArray(taxon?.children) &&
        taxon.children.length === 0;

    const parentLink =
        breadcrumbPath.length >= 2
            ? `/category/${breadcrumbPath[breadcrumbPath.length - 2].code}`
            : undefined;

    console.log('[isInLeaf]', isInLeaf, 'children:', taxon?.children, 'breadcrumbPath:', breadcrumbPath);

    return (
        <Layout>
            <div className="container mt-4 mb-5">
                <Breadcrumbs paths={breadcrumbs} />

                <div className="row mt-5">
                    <div className="col-12 col-lg-3">
                        {isInLeaf && parentLink && (
                            <div className="mb-3">
                                <Link to={parentLink} className="text-decoration-none">
                                    Go level up
                                </Link>
                            </div>
                        )}
                        {taxon && Array.isArray(taxon.children) && taxon.children.length > 0 && (
                            <div className="mb-4">
                                {taxon.children.map((child) => (
                                    <div key={child.code}>
                                        <Link
                                            to={`/category/${taxon.code}/${child.code}`}
                                            className="text-decoration-none d-block mb-1"
                                        >
                                            {child.name}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="col-12 col-lg-9">
                        <div className="mb-4">
                            <h1 className="mb-3">
                                {loading ? <Skeleton /> : taxon?.name}
                            </h1>
                            <div>
                                {loading ? (
                                    <Skeleton count={2} />
                                ) : (
                                    taxon?.description || ''
                                )}
                            </div>
                        </div>

                        <ProductToolbar />

                        <div className="products-grid">
                            {loading
                                ? Array.from({ length: 9 }).map((_, i) => (
                                    <Skeleton key={i} height={300} />
                                ))
                                : products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                        </div>

                        {loadingMore && (
                            <div className="text-center mt-4">
                                <div className="spinner-border text-primary" role="status" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ProductList;
