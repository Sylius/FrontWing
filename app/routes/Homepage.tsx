import { type LoaderFunctionArgs } from "react-router";
import { Await, useLoaderData } from "react-router";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";

import ProductsList from "~/components/ProductsList";
import Layout from "~/layouts/Default";
import type { Product } from "~/types/Product";

export async function loader({}: LoaderFunctionArgs) {
    const API_URL = process.env.PUBLIC_API_URL;

    const productsPromise = fetch(`${API_URL}/api/v2/shop/products?itemsPerPage=8`)
        .then((res) => {
            if (!res.ok) throw new Error("Error loading products");
            return res.json();
        })
        .then((data) => data["hydra:member"] || data.items || data);

    return {
        products: productsPromise,
        apiUrl: API_URL,
    };
}

export default function Homepage() {
    const { t } = useTranslation("product");
    const { products, apiUrl } = useLoaderData<typeof loader>();

    return (
        <Layout>
            <div className="mb-5">
                <div className="overflow-hidden">
                    <div className="d-flex justify-content-center align-items-center position-relative">
                        <img
                            src={`${apiUrl}/build/shop/images/homepage-banner.8ec389de.webp`}
                            width="1920"
                            height="793"
                            className="img-fluid"
                            alt={t("home.bannerAlt")}
                        />
                        <img
                            src={`${apiUrl}/build/shop/images/homepage-banner-logo.6759d0fb.webp`}
                            className="position-absolute"
                            style={{ maxWidth: "40vw" }}
                            alt={t("home.bannerLogoAlt")}
                        />
                    </div>
                </div>
            </div>

            <div className="container mb-5">
                <Suspense fallback={<Skeleton count={1} height={300} className="mb-3" />}>
                    <Await resolve={products}>
                        {(resolved: Product[]) => (
                            <ProductsList products={resolved} limit={4} name={t("home.latestDeals")} />
                        )}
                    </Await>
                </Suspense>
            </div>

            <div className="container mb-5">
                <div className="mb-5">
                    <h2>{t("home.newCollection")}</h2>
                </div>
                <div className="photo-grid">
                    <div className="photo-grid-item-1">
                        <img
                            src={`${apiUrl}/build/shop/images/homepage-new-collection-photo-1.2b163989.webp`}
                            className="object-fit-cover w-100 h-100 rounded-3"
                            loading="lazy"
                            alt={t("home.newCollectionAlt")}
                        />
                    </div>
                    <div className="photo-grid-item-2">
                        <img
                            src={`${apiUrl}/build/shop/images/homepage-new-collection-photo-2.2c91a0c3.webp`}
                            className="object-fit-cover w-100 h-100 rounded-3"
                            loading="lazy"
                            alt={t("home.newCollectionAlt")}
                        />
                    </div>
                    <div className="photo-grid-item-3">
                        <img
                            src={`${apiUrl}/build/shop/images/homepage-new-collection-photo-3.466a0c4c.webp`}
                            className="object-fit-cover w-100 h-100 rounded-3"
                            loading="lazy"
                            alt={t("home.newCollectionAlt")}
                        />
                    </div>
                </div>
            </div>
    
            <div className="container">
                <Suspense fallback={<Skeleton count={1} height={300} className="mb-3" />}>
                    <Await resolve={products}>
                        {(resolved: Product[]) => (
                            <ProductsList products={resolved} limit={8} name={t("home.latestProducts")} />
                        )}
                    </Await>
                </Suspense>
            </div>
        </Layout>
    );
}
