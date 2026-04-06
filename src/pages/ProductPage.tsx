import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { InfoIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Link, useParams } from "react-router-dom";
import Slider, { Settings } from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { NextArrow, PrevArrow } from "../components/Arrow";
import Breadcrumbs from "../components/Breadcrumbs";
import ReviewList from "../components/product/Reviews";
import ReviewSummary from "../components/product/ReviewSummary";
import ReviewSummarySkeleton from "../components/product/ReviewSummarySkeleton";
import ProductCard from "../components/ProductCard";
import { useFlashMessages } from "../context/FlashMessagesContext";
import { useOrder } from "../context/OrderContext";
import Layout from "../layouts/Default";
import {
  Product,
  ProductAttribute,
  ProductOption,
  ProductOptionValue,
  ProductReview,
  ProductVariantDetails,
} from "../types/Product";
import { formatPrice } from "../utils/price";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

interface ApiProduct extends Product {
  productTaxons?: string[];
  associations?: string[];
  options?: string[];
  reviews?: { "@id": string }[];
  defaultVariant?: string;
}

interface Association {
  title: string;
  products: Product[];
}

const AssociationsSection: React.FC<{
  associations: Association[];
  loading: boolean;
}> = ({ associations, loading }) => {
  if (loading) {
    return (
      <div className="relative container mb-5">
        <Skeleton width={200} height={24} className="mb-3" />
        <div className="flex">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="px-2" style={{ flex: "1 0 auto" }}>
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
        <div key={title} className="relative container mb-5">
          <h2 className="mb-3 text-xl font-semibold">{title}</h2>
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
  const { fetchOrder } = useOrder();
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
    const res = await fetch(`${API_URL}${url}`);
    const data = await res.json();
    const values: ProductOptionValue[] = await Promise.all(
      data.values.map((v: string) => fetch(`${API_URL}${v}`).then((r) => r.json()))
    );
    return { code: data.code, name: data.name, values };
  };

  const fetchVariantByOptions = async (prodCode: string, sel: Record<string, string>) => {
    const params = Object.entries(sel)
      .map(([opt, val]) => `optionValues[]=/api/v2/shop/product-options/${opt}/values/${val}`)
      .join("&");
    const res = await fetch(
      `${API_URL}/api/v2/shop/product-variants?product=/api/v2/shop/products/${prodCode}&${params}`
    );
    const data = await res.json();
    setVariant(data["hydra:member"]?.[0] ?? null);
  };

  const fetchProductAttributes = async (prodCode: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v2/shop/products/${prodCode}/attributes`);
      const data = await res.json();
      setAttributes(data["hydra:member"] ?? []);
    } catch (e) {
      console.error("attributes error", e);
    }
  };

  const fetchProductReviews = async (refs: { "@id": string }[]) => {
    setAllReviewCount(refs.length);
    const data: ProductReview[] = await Promise.all(
      refs.map((ref) => fetch(`${API_URL}${ref["@id"]}`).then((r) => r.json()))
    );
    setReviews(
      data
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    );
  };

  const fetchAssociations = async (urls: string[]) => {
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
      console.error("associations error", e);
    } finally {
      setAssociationsLoading(false);
    }
  };

  useEffect(() => {
    if (!code) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_URL}/api/v2/shop/products/${code}`);
        const data: ApiProduct = await res.json();
        setProduct(data);

        // breadcrumbs
        const bc = [{ label: "Home", url: "/" }];
        if (data.productTaxons?.length) {
          const visited = new Set<string>();
          for (const taxonUrl of data.productTaxons) {
            const tRes = await fetch(`${API_URL}${taxonUrl}`);
            const tData = await tRes.json();
            const taxRes = await fetch(`${API_URL}${tData.taxon}`);
            const tax: { name: string; code: string; parent?: string } = await taxRes.json();
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

        // images
        if (data.images?.length) setActiveImage(data.images[0].path);

        // options / default
        if (data.options?.length) {
          const opts = await Promise.all(data.options.map(fetchOption));
          setOptions(opts);
          const sel: Record<string, string> = {};
          opts.forEach((o) => (sel[o.code] = o.values[0]?.code ?? ""));
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
        console.error("product fetch error", e);
        setError("Error while loading product data");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [code]);

  const handleOptionChange = (opt: string, val: string) => {
    const upd = { ...selectedValues, [opt]: val };
    setSelectedValues(upd);
    if (product) fetchVariantByOptions(product.code, upd);
  };

  const handleAddToCart = async () => {
    if (!variant) return;
    setIsAddToCartLoading(true);
    try {
      const resp = await fetch(
        `${API_URL}/api/v2/shop/orders/${localStorage.getItem("orderToken")}/items`,
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

  const labelClass = "block text-sm font-medium mb-1";

  const accordionSections = useMemo<{ title: string; content: React.ReactNode }[]>(() => {
    if (!product) return [];
    return [
      {
        title: "Details",
        content: <p>{product.description}</p>,
      },
      {
        title: "Attributes",
        content: attributes.length ? (
          <Table>
            <TableBody>
              {attributes.map((a) => (
                <TableRow key={a.id}>
                  <TableHead className="pr-4 text-left font-bold">{a.name}</TableHead>
                  <TableCell>{a.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p>No attributes available.</p>
        ),
      },
      {
        title: `Reviews (${allReviewCount})`,
        content: reviews.length ? (
          <>
            <ReviewList reviews={reviews} />
            <div className="flex flex-wrap gap-3">
              <Button>
                <Link
                  to={`/product/${code}/review/new`}
                  className="text-primary-foreground hover:text-primary-foreground! no-underline!"
                >
                  Add your review
                </Link>
              </Button>
              <a
                href={`/product/${code}/reviews`}
                className="text-primary inline-flex items-center px-4 py-2 text-sm hover:underline"
              >
                View more
              </a>
            </div>
          </>
        ) : (
          <>
            <Alert className="mb-3">
              <InfoIcon />
              <AlertTitle>Info</AlertTitle>
              <AlertDescription>There are no reviews</AlertDescription>
            </Alert>
            <Button>
              <Link
                to={`/product/${code}/review/new`}
                className="text-primary-foreground hover:text-primary-foreground! no-underline!"
              >
                Add your review
              </Link>
            </Button>
          </>
        ),
      },
    ];
  }, [product, attributes, reviews, allReviewCount, code]);

  const lightboxSlides = product?.images?.map((img) => ({ src: img.path })) ?? [];
  const lightboxIndex = product?.images?.findIndex((img) => img.path === activeImage) ?? 0;

  if (error) return <div className="text-destructive text-center">{error}</div>;

  return (
    <Layout>
      <div className="container mt-4 mb-5">
        <Breadcrumbs paths={breadcrumbs} />
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[6fr_6fr]">
          <div>
            <div className="mb-5 flex flex-wrap">
              {product && product.images.length > 1 && (
                <div className="hidden w-auto pr-4 lg:block">
                  <div className="product-thumbnails flex flex-col overflow-auto">
                    {product.images.map((img) => (
                      <Button
                        key={img.id}
                        variant="ghost"
                        size="icon"
                        onClick={() => setActiveImage(img.path)}
                        className={`h-auto w-25 overflow-hidden rounded p-0 ${
                          activeImage === img.path ? "opacity-100" : "cursor-pointer opacity-50"
                        }`}
                      >
                        <img
                          src={img.path}
                          alt="thumbnail"
                          className="h-full w-full object-cover"
                        />
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex-1">
                <div
                  className="product-main-image-wrapper bg-muted overflow-hidden rounded-xl"
                  onClick={() => setLightboxOpen(true)}
                >
                  {loading ? (
                    <Skeleton style={{ width: "100%", height: "100%" }} />
                  ) : (
                    product && (
                      <img
                        src={activeImage ?? product.images[0].path}
                        alt={product.name}
                        className="h-full w-full max-w-full object-cover"
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="sticky top-2 pt-2">
              <h1 className="mb-4 text-2xl font-bold wrap-break-word">{product?.name}</h1>
              {loading ? (
                <ReviewSummarySkeleton />
              ) : (
                product && (
                  <ReviewSummary
                    reviews={reviews}
                    productCode={product.code}
                    allReviewCount={allReviewCount}
                  />
                )
              )}
              <div className="mb-3 text-2xl">
                {loading ? (
                  <Skeleton width={100} />
                ) : variant?.price != null ? (
                  `$${formatPrice(variant.price)}`
                ) : (
                  "No price available"
                )}
              </div>
              {options.map((opt) => (
                <div className="mb-3" key={opt.code}>
                  <label className={labelClass}>{opt.name}</label>
                  <Select
                    value={selectedValues[opt.code] ?? ""}
                    onValueChange={(value) => value && handleOptionChange(opt.code, value)}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {(value: string | null) =>
                          opt.values.find((v) => v.code === value)?.value ?? "Select..."
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {opt.values.map((v) => (
                        <SelectItem key={v.code} value={v.code}>
                          {v.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <div className="my-4">
                <label className={labelClass}>Quantity</label>
                <Input
                  type="number"
                  value={quantity}
                  min={1}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
                <Button
                  className="mt-3 cursor-pointer"
                  onClick={handleAddToCart}
                  disabled={isAddToCartLoading || loading}
                >
                  {isAddToCartLoading ? "Adding..." : "Add to cart"}
                </Button>
              </div>
              <div className="mb-3">{product?.shortDescription ?? "No short description"}</div>
            </div>
          </div>
        </div>
        {!loading && accordionSections.length > 0 && (
          <Accordion defaultValue={["item-0"]} className="w-full">
            {accordionSections.map((section, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="rounded-none border-x-0">
                <AccordionTrigger className="px-0 hover:no-underline">
                  <span className="py-2 text-lg font-semibold">{section.title}</span>
                </AccordionTrigger>
                <AccordionContent className="px-0 pt-2 pb-4">{section.content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
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
