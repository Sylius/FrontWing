import { useQuery } from "@tanstack/react-query";
import React from "react";
import ProductsList from "../components/ProductsList";
import Layout from "../layouts/Default";
import { Product } from "../types/Product";

const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/products?itemsPerPage=8`
  );
  if (!response.ok) {
    throw new Error("Error while loading products");
  }

  const data = await response.json();
  return data["hydra:member"] || data.items || data;
};

const Homepage: React.FC = () => {
  const {
    data: products,
    isLoading,
    isError,
    error,
  } = useQuery<Product[], Error>({
    queryKey: ["products", "homepage"],
    queryFn: fetchProducts,
  });

  return (
    <Layout>
      <div className="mb-10">
        <div className="overflow-hidden">
          <div className="relative flex items-center justify-center">
            <img
              src={`${
                import.meta.env.VITE_REACT_APP_API_URL
              }/build/shop/images/homepage-banner.8ec389de.webp`}
              width="1920"
              height="793"
              className="h-auto max-w-full"
              alt="Home"
            />
            <img
              src={`${
                import.meta.env.VITE_REACT_APP_API_URL
              }/build/shop/images/homepage-banner-logo.6759d0fb.webp`}
              className="absolute"
              style={{ maxWidth: "40vw" }}
              alt="New collection"
            />
          </div>
        </div>
      </div>
      <div className="container mb-10">
        {isLoading && <div className="text-center">Loading products...</div>}
        {isError && <div className="text-destructive text-center">Error: {error.message}</div>}

        {products && <ProductsList products={products} limit={4} name={"Latest deals"} />}
      </div>
      <div className="container mb-10">
        <h2 className="mb-5">New collection</h2>

        <div className="photo-grid">
          <div className="photo-grid-item-1">
            <img
              src={`${
                import.meta.env.VITE_REACT_APP_API_URL
              }/build/shop/images/homepage-new-collection-photo-1.2b163989.webp`}
              className="h-full w-full rounded-xl object-cover"
              loading="lazy"
              alt="New collection"
            />
          </div>
          <div className="photo-grid-item-2">
            <img
              src={`${
                import.meta.env.VITE_REACT_APP_API_URL
              }/build/shop/images/homepage-new-collection-photo-2.2c91a0c3.webp`}
              className="h-full w-full rounded-xl object-cover"
              loading="lazy"
              alt="New collection"
            />
          </div>
          <div className="photo-grid-item-3">
            <img
              src={`${
                import.meta.env.VITE_REACT_APP_API_URL
              }/build/shop/images/homepage-new-collection-photo-3.466a0c4c.webp`}
              className="h-full w-full rounded-xl object-cover"
              loading="lazy"
              alt="New collection"
            />
          </div>
        </div>
      </div>

      <div className="container">
        {products && <ProductsList products={products} limit={8} name={"Latest products"} />}
      </div>
    </Layout>
  );
};

export default Homepage;
