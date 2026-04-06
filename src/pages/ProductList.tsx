import React, { useCallback, useEffect, useMemo, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import ProductCard from "../components/ProductCard";
import ProductToolbar from "../components/taxons/ProductToolbar";
import Layout from "../layouts/Default";
import { Product } from "../types/Product";
import NotFoundPage from "./NotFoundPage";

interface TaxonDetails {
  name: string;
  description: string;
  code: string;
  parent?: { name: string; code: string };
  children?: { name: string; code: string }[];
}

const ITEMS_PER_PAGE = 9;

const ProductList: React.FC = () => {
  const { parentCode, childCode } = useParams<{ parentCode?: string; childCode?: string }>();
  const [searchParams] = useSearchParams();

  // State Management
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [taxonDetails, setTaxonDetails] = useState<TaxonDetails | null>(null);
  const [parentTaxon, setParentTaxon] = useState<{ name: string; code: string } | null>(null);

  // Pre-flight check state: null (checking), true (exists), false (404)
  const [taxonExists, setTaxonExists] = useState<boolean | null>(null);

  const taxonCode = childCode || parentCode;
  const API = import.meta.env.VITE_REACT_APP_API_URL;

  /**
   * Generates the product API URL with current filters and pagination
   */
  const getProductsUrl = useCallback(
    (page: number, code: string) => {
      const queryParams = searchParams.toString();
      const baseUrl = `${API}/api/v2/shop/products`;
      return `${baseUrl}?itemsPerPage=${ITEMS_PER_PAGE}&page=${page}&productTaxons.taxon.code=${code}${
        queryParams ? "&" + queryParams : ""
      }`;
    },
    [API, searchParams]
  );

  /**
   * Fetches full taxon details, including parent and children metadata in parallel
   */
  const fetchTaxonDetails = useCallback(
    async (code: string): Promise<TaxonDetails | null> => {
      try {
        const res = await fetch(`${API}/api/v2/shop/taxons/${code}`);
        if (!res.ok) return null;

        const data = await res.json();
        const tasks: Promise<{ name: string; code: string }>[] = [];

        // Queue parent fetch if available
        if (data.parent) {
          tasks.push(fetch(`${API}${data.parent}`).then((r) => r.json()));
        }

        // Queue all children fetches simultaneously (Performance Optimization)
        if (data.children?.length) {
          data.children.forEach((url: string) => {
            tasks.push(fetch(`${API}${url}`).then((r) => r.json()));
          });
        }

        const results = await Promise.all(tasks);

        let parentData: TaxonDetails["parent"] = undefined;
        if (data.parent) {
          const parentJson = results.shift();
          if (parentJson) {
            parentData = { name: parentJson.name, code: parentJson.code };
            setParentTaxon(parentData);
          }
        }

        const children = results.map((childJson) => ({
          name: childJson.name,
          code: childJson.code,
        }));

        return {
          name: data.name,
          description: data.description,
          code: data.code,
          parent: parentData,
          children,
        };
      } catch (err) {
        console.error("Error fetching taxon details:", err);
        return null;
      }
    },
    [API]
  );

  /**
   * Initial Data Load with Pre-flight Check logic
   */
  useEffect(() => {
    const loadInitialData = async () => {
      if (!taxonCode) return;

      setLoading(true);
      setError(null);
      setTaxonExists(null);

      try {
        // Step 1: Verify Taxon Existence
        const tData = await fetchTaxonDetails(taxonCode);

        if (!tData) {
          setTaxonExists(false);
          setLoading(false);
          return;
        }

        setTaxonDetails(tData);
        setTaxonExists(true);

        // Step 2: Load Products only if Taxon is valid
        const productUrl = getProductsUrl(1, taxonCode);
        const pRes = await fetch(productUrl).then((r) => r.json());

        const totalItems = pRes["hydra:totalItems"] || 0;
        setProducts(pRes["hydra:member"] || []);
        setHasMore(1 * ITEMS_PER_PAGE < totalItems);
        setCurrentPage(1);
      } catch {
        setError("An error occurred while loading the products.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [taxonCode, getProductsUrl, fetchTaxonDetails]);

  /**
   * Infinite Scroll: Load more products
   */
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !taxonCode) return;

    setLoadingMore(true);
    const nextPage = currentPage + 1;
    try {
      const response = await fetch(getProductsUrl(nextPage, taxonCode));
      const data = await response.json();
      const newProducts: Product[] = data["hydra:member"] || [];

      setProducts((prev) => [...prev, ...newProducts]);
      setHasMore(nextPage * ITEMS_PER_PAGE < (data["hydra:totalItems"] || 0));
      setCurrentPage(nextPage);
    } catch (err) {
      console.error("Error loading more products:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, taxonCode, hasMore, loadingMore, getProductsUrl]);

  /**
   * Scroll Event Listener for Infinite Scroll
   */
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollHeight - scrollTop - clientHeight < 300) {
        loadMore();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMore]);

  // Breadcrumbs logic
  const isInChildTaxon = !!childCode && !!taxonDetails?.parent;
  const breadcrumbs = useMemo(() => {
    const base = [{ label: "Home", url: "/" }];
    if (isInChildTaxon && parentTaxon) {
      return [
        ...base,
        { label: "Category", url: `/${parentTaxon.code}` },
        { label: parentTaxon.name, url: `/${parentTaxon.code}` },
        { label: taxonDetails?.name || "", url: `/${parentTaxon.code}/${taxonDetails?.code}` },
      ];
    }
    if (taxonDetails) {
      return [
        ...base,
        { label: "Category", url: `/${taxonDetails.code}` },
        { label: taxonDetails.name, url: `/${taxonDetails.code}` },
      ];
    }
    return base;
  }, [isInChildTaxon, parentTaxon, taxonDetails]);

  // Early Return 1: Error handling
  if (error) return <div className="text-destructive p-20 text-center font-bold">{error}</div>;

  // Early Return 2: Pre-flight failure (404)
  if (taxonExists === false) return <NotFoundPage />;

  // Early Return 3: Initial loading (Global spinner or blank)
  // This prevents the skeleton from showing before we know if the page exists
  if (loading && taxonExists === null) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mt-4 mb-5">
        <Breadcrumbs paths={breadcrumbs} />

        <div className="-mx-4 mt-5 flex flex-wrap">
          {/* Sidebar */}
          <aside className="w-full px-4 lg:w-1/4">
            {isInChildTaxon && parentTaxon && (
              <div className="mb-6">
                <Link
                  to={`/${parentTaxon.code}`}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  ← Back to {parentTaxon.name}
                </Link>
              </div>
            )}

            {!isInChildTaxon && (taxonDetails?.children?.length ?? 0) > 0 && (
              <nav className="border-primary/20 mb-8 space-y-2 border-l-2 pl-4">
                <p className="text-muted-foreground mb-4 text-xs font-bold tracking-widest uppercase">
                  Subcategories
                </p>
                {taxonDetails?.children?.map((child) => (
                  <Link
                    key={child.code}
                    to={`/${taxonDetails.code}/${child.code}`}
                    className="hover:text-primary block py-1 text-sm transition-colors"
                  >
                    {child.name}
                  </Link>
                ))}
              </nav>
            )}
          </aside>

          {/* Main Content */}
          <main className="w-full px-4 lg:w-3/4">
            <header className="mb-8">
              <h1 className="mb-3 text-3xl font-extrabold">
                {loading ? <Skeleton width={250} /> : taxonDetails?.name}
              </h1>
              <div className="text-muted-foreground leading-relaxed">
                {loading ? <Skeleton count={2} /> : taxonDetails?.description}
              </div>
            </header>

            <ProductToolbar />

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton height={300} borderRadius={12} />
                      <Skeleton width="60%" />
                      <Skeleton width="40%" />
                    </div>
                  ))
                : products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>

            {loadingMore && (
              <div className="mt-12 flex justify-center">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
              </div>
            )}

            {!hasMore && products.length > 0 && (
              <p className="text-muted-foreground mt-12 text-center text-sm italic">
                End of results.
              </p>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default ProductList;
