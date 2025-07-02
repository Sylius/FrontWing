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
    const API_URL = process.env.API_URL;

    const productRes = await fetch(`${API_URL}/api/v2/shop/products/${code}?include=associations.products.images,variants,options,attributes,reviews`);
    if (!productRes.ok) throw new Response('Product not found', { status: 404 });
    const product: Product = await productRes.json();

    const variant: ProductVariantDetails | null = product.defaultVariantData ?? null;

    const [
        attributesData,
        reviewsData,
        associationsData,
        optionsData,
        variantsData,
    ] = await Promise.all([
        fetch(`${API_URL}/api/v2/shop/products/${code}/attributes`).then((r) => r.json()),
        Promise.all(
            product.reviews?.slice(0, 5).map((r) =>
                fetch(`${API_URL}${r['@id']}`).then((res) => res.json())
            ) ?? []
        ),
        Promise.all(
            product.associations?.map(async (url: string) => {
                const assoc = await fetch(`${API_URL}${url}`).then((r) => r.json());
                const assocType = await fetch(`${API_URL}${assoc.type}`).then((r) => r.json());
                const assocProducts = await Promise.all(
                    assoc.associatedProducts.map((url: string) =>
                        fetch(`${API_URL}${url}`).then((r) => r.json())
                    )
                );
                return { title: assocType.name, products: assocProducts };
            }) ?? []
        ),
        Promise.all(
            product.options?.map(async (url: string) => {
                const opt = await fetch(`${API_URL}${url}`).then((r) => r.json());
                const values = await Promise.all(
                    opt.values.map((vUrl: string) => fetch(`${API_URL}${vUrl}`).then((r) => r.json()))
                );
                return { code: opt.code, name: opt.name, values };
            }) ?? []
        ),
        Promise.all(
            product.variants?.map(async (url: string) => {
                const v = await fetch(`${API_URL}${url}`).then((r) => r.json());
                const optionValues = await Promise.all(
                    v.optionValues.map((vUrl: string) =>
                        fetch(`${API_URL}${vUrl}`).then((r) => r.json())
                    )
                );
                return {
                    id: v.id,
                    code: v.code,
                    name: v.name,
                    price: v.price,
                    optionValues: optionValues.map((ov) => ({
                        code: ov.code,
                        value: ov.value,
                        option: { code: ov.option.split('/').pop(), name: '' },
                    })),
                };
            }) ?? []
        ),
    ]);

    const breadcrumbs: { label: string; url: string }[] = [
        { label: 'Home', url: '/' },
        { label: 'Category', url: '#' },
        { label: product.name, url: `/product/${product.code}` },
    ];

    return json({
        product,
        variant,
        attributes: attributesData['hydra:member'] ?? [],
        reviews: reviewsData,
        associations: associationsData,
        options: optionsData,
        variants: variantsData,
        breadcrumbs,
    });
}

export default function ProductPageRoute() {
    const data = useLoaderData<typeof loader>() as Props;
    return <ProductPage {...data} />;
}
