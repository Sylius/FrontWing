export interface ProductTaxon {
    taxon: string;
}

export interface Taxon {
    id: number;
    code: string;
    slug: string;
    name: string;
    description?: string;
    level?: number;
    children?: string[];
    parent?: string; // może być URL np. "/api/v2/shop/taxons/t_shirts"
}

export interface TaxonChild {
    id: number;
    name: string;
    slug: string;
    code: string;
    description: string;
}
