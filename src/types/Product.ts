export interface Product {
  id: number;
  slug: string;
  name: string;
  code: string;
  description: string;
  shortDescription: string;
  variants: string[];
  images: Image[];
  options?: string[];
  reviews?: { "@id": string }[];
  mainTaxon?: string;
  productTaxons?: string[];
  defaultVariant?: string;
  associations?: string[];
}

export interface ProductOption {
  code: string;
  name: string;
  values: ProductOptionValue[];
}

export interface ProductOptionValue {
  code: string;
  value: string;
}

export interface ProductVariantDetails {
  id: number;
  price: number;
  code: string;
  name?: string;
}

export interface Image {
  id: number;
  path: string;
}

export interface ProductAttribute {
  id: number;
  name: string;
  value: string;
}

export interface ProductReview {
  id: number;
  title: string;
  rating: number;
  comment: string;
  createdAt: string;
  author?: {
    firstName: string | null;
  };
}
