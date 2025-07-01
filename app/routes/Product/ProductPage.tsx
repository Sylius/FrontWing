import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import ProductPage from '~/components/ProductPage';
import type {
    Product as BaseProduct,
    ProductOption,
    ProductOptionValue,
    ProductVariantDetails,
    ProductAttribute,
    ProductReview,
} from '~/types/Product';

type Product = BaseProduct & {
    defaultVariantData?: ProductVariantDetails;
};

type Props = {
    product: Product;
    variant: ProductVariantDetails | null;
    attributes: ProductAttribute[];
    reviews: ProductReview[];
    associations: { title: string; products: BaseProduct[] }[];
    options: ProductOption[];
    variants: ProductVariantDetails[];
    breadcrumbs: { label: string; url: string }[];
};

export async function loader({ params }: LoaderFunctionArgs) {
    const code = params.code!;
    const API_URL = process.env.API_URL || 'http://localhost:8000';

    const res = await fetch(`${API_URL}/api/v2/shop/products/${code}`);
    if (!res.ok) throw new Response('Product not found', { status: 404 });
    const product: Product = await res.json();

    const variant: ProductVariantDetails | null = product.defaultVariantData ?? null;

    const attributes: ProductAttribute[] = await fetch(`${API_URL}/api/v2/shop/products/${code}/attributes`)
        .then((r) => r.json())
        .then((d) => d['hydra:member'] ?? []);

    const reviews: ProductReview[] = product.reviews?.length
        ? await Promise.all(
            product.reviews.map((r) => fetch(`${API_URL}${r['@id']}`).then((res) => res.json()))
        ).then((list) =>
            list
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
        )
        : [];

    const associations = product.associations?.length
        ? await Promise.all(
            product.associations.map(async (url: string) => {
                const assoc = await fetch(`${API_URL}${url}`).then((r) => r.json());
                const assocType = await fetch(`${API_URL}${assoc.type}`).then((r) => r.json());
                const assocProducts = await Promise.all(
                    assoc.associatedProducts.map((url: string) =>
                        fetch(`${API_URL}${url}`).then((r) => r.json())
                    )
                );
                return {
                    title: assocType.name as string,
                    products: assocProducts as BaseProduct[],
                };
            })
        )
        : [];

    const options: ProductOption[] = product.options?.length
        ? await Promise.all(
            product.options.map(async (url: string) => {
                const opt = await fetch(`${API_URL}${url}`).then((r) => r.json());
                const values: ProductOptionValue[] = await Promise.all(
                    opt.values.map((vUrl: string) => fetch(`${API_URL}${vUrl}`).then((r) => r.json()))
                );
                return { code: opt.code, name: opt.name, values };
            })
        )
        : [];

    const variants: ProductVariantDetails[] = product.variants?.length
        ? await Promise.all(
            product.variants.map(async (url: string) => {
                const v = await fetch(`${API_URL}${url}`).then((r) => r.json());
                const optionValues = v.optionValues?.length
                    ? await Promise.all(
                        v.optionValues.map((vUrl: string) =>
                            fetch(`${API_URL}${vUrl}`).then((r) => r.json())
                        )
                    )
                    : [];

                return {
                    id: v.id,
                    code: v.code,
                    name: v.name,
                    price: v.price,
                    optionValues: optionValues.map((ov) => ({
                        code: ov.code,
                        value: ov.value,
                        option: {
                            code: ov.option.split('/').pop(),
                            name: '',
                        },
                    })),
                };
            })
        )
        : [];

    const breadcrumbs: { label: string; url: string }[] = [{ label: 'Home', url: '/' }, { label: 'Category', url: '#' }];
    const visited = new Set<string>();

    for (const productTaxonUrl of product.productTaxons ?? []) {
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
                breadcrumbs.push({ label: p.name, url: `/${p.code}` });
            }
        }
    }

    breadcrumbs.push({ label: product.name, url: `/product/${product.code}` });

    return json({
        product,
        variant,
        attributes,
        reviews,
        associations,
        options,
        variants,
        breadcrumbs,
    });
}

export default function ProductPageRoute() {
    const data = useLoaderData<typeof loader>() as Props;
    return <ProductPage {...data} />;
}
