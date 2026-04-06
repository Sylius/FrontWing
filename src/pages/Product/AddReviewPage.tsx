import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IconStar } from "@tabler/icons-react";
import React, { useEffect, useRef, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import ProductCard from "../../components/ProductCard";
import { useFlashMessages } from "../../context/FlashMessagesContext";
import Layout from "../../layouts/Default";
import { Product } from "../../types/Product";
import { useForm } from "@tanstack/react-form";
import { reviewSchema } from "@/schemas/review";
import { FieldError } from "@/components/ui/field-error";
import { submitForm } from "@/lib/utils";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

const labelClass = "block text-sm font-medium mb-1";

const AddReviewPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { addMessage } = useFlashMessages();
  const formRef = useRef<HTMLFormElement>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; url: string }[]>([]);

  const form = useForm({
    defaultValues: {
      rating: 5,
      title: "",
      comment: "",
      email: "",
    },
    validators: {
      onSubmit: reviewSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const res = await fetch(`${API_URL}/api/v2/shop/product-reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: value.title,
            rating: value.rating,
            comment: value.comment,
            email: value.email,
            product: `/api/v2/shop/products/${code}`,
          }),
        });

        if (!res.ok) throw new Error("Failed to submit review");

        addMessage("success", "Success — Your review is waiting for the acceptation.");
        navigate(`/product/${code}`);
      } catch (err) {
        console.error("Error submitting review:", err);
        addMessage("error", "Failed to submit your review");
      }
    },
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v2/shop/products/${code}`);
        const data: Product = await res.json();
        setProduct(data);

        const breadcrumbPaths: { label: string; url: string }[] = [
          { label: "Home", url: "/" },
          { label: "Category", url: "#" },
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

          breadcrumbPaths.push({ label: data.name, url: `/product/${data.code}` });
          breadcrumbPaths.push({ label: "Reviews", url: `/product/${data.code}/reviews` });
          breadcrumbPaths.push({ label: "Add", url: "#" });
        }

        setBreadcrumbs(breadcrumbPaths);
      } catch (err) {
        console.error("Error loading product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (code) fetchProduct();
  }, [code]);

  return (
    <Layout>
      <div className="container mt-4 mb-5">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <Breadcrumbs paths={breadcrumbs} />
          </div>

          <div className="w-full px-4 md:w-5/12 lg:w-4/12">
            {loading ? <Skeleton height={400} /> : product && <ProductCard product={product} />}
          </div>

          <div className="w-full px-4 md:w-7/12 lg:w-8/12">
            <h1>Add Your Review</h1>
            <form
              ref={formRef}
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void submitForm(form, formRef.current);
              }}
            >
              <div className="mb-3">
                <label className={labelClass}>
                  Rating <span className="text-destructive">*</span>
                </label>
                <form.Field
                  name="rating"
                  validators={{
                    onSubmit: reviewSchema.shape.rating,
                    onBlur: reviewSchema.shape.rating,
                  }}
                >
                  {(field) => (
                    <>
                      <div
                        className="flex gap-1"
                        role="radiogroup"
                        aria-label="Rating"
                        aria-describedby="rating-error"
                      >
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            key={value}
                            onClick={() => field.handleChange(value)}
                            aria-label={`${value} star`}
                          >
                            <IconStar
                              className="text-yellow-400"
                              stroke={2}
                              size={20}
                              fill={value <= field.state.value ? "currentColor" : "none"}
                            />
                          </Button>
                        ))}
                      </div>
                      <FieldError
                        id="rating-error"
                        errors={field.state.meta.errors}
                        isTouched={field.state.meta.isTouched}
                        isSubmitted={form.state.isSubmitted}
                      />
                    </>
                  )}
                </form.Field>
              </div>

              <div className="mb-3">
                <label className={labelClass}>
                  Title <span className="text-destructive">*</span>
                </label>
                <form.Field
                  name="title"
                  validators={{
                    onSubmit: reviewSchema.shape.title,
                    onBlur: reviewSchema.shape.title,
                  }}
                >
                  {(field) => (
                    <>
                      <Input
                        type="text"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        required
                        aria-describedby="title-error"
                        aria-invalid={(field.state.meta.errors?.length ?? 0) > 0 || undefined}
                      />
                      <FieldError
                        id="title-error"
                        errors={field.state.meta.errors}
                        isTouched={field.state.meta.isTouched}
                        isSubmitted={form.state.isSubmitted}
                      />
                    </>
                  )}
                </form.Field>
              </div>

              <div className="mb-3">
                <label className={labelClass}>
                  Comment <span className="text-destructive">*</span>
                </label>
                <form.Field
                  name="comment"
                  validators={{
                    onSubmit: reviewSchema.shape.comment,
                    onBlur: reviewSchema.shape.comment,
                  }}
                >
                  {(field) => (
                    <>
                      <Textarea
                        rows={4}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        required
                        aria-describedby="comment-error"
                        aria-invalid={(field.state.meta.errors?.length ?? 0) > 0 || undefined}
                      />
                      <FieldError
                        id="comment-error"
                        errors={field.state.meta.errors}
                        isTouched={field.state.meta.isTouched}
                        isSubmitted={form.state.isSubmitted}
                      />
                    </>
                  )}
                </form.Field>
              </div>

              <div className="mb-4">
                <label className={labelClass}>
                  Email <span className="text-destructive">*</span>
                </label>
                <form.Field
                  name="email"
                  validators={{
                    onSubmit: reviewSchema.shape.email,
                    onBlur: reviewSchema.shape.email,
                  }}
                >
                  {(field) => (
                    <>
                      <Input
                        type="email"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        required
                        aria-describedby="email-error"
                        aria-invalid={(field.state.meta.errors?.length ?? 0) > 0 || undefined}
                      />
                      <FieldError
                        id="email-error"
                        errors={field.state.meta.errors}
                        isTouched={field.state.meta.isTouched}
                        isSubmitted={form.state.isSubmitted}
                      />
                    </>
                  )}
                </form.Field>
              </div>

              <Button type="submit">Add</Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddReviewPage;
