export interface ProductTaxon {
  taxon: string;
}

export interface Taxon {
  id: number;
  code: string;
  slug: string;
  name: string;
  description: string;
  children: string[];
  parent?: string;
}
export interface TaxonChild {
  id: number;
  name: string;
  slug: string;
  code: string;
  description: string;
}
