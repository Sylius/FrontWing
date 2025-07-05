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
        associationTypes,
        optionsData,
        variantsData,
    ] = await Promise.all([
        fetch(`${API_URL}/api/v2/shop/products/${code}/attributes`).then((r) => r.json()),
        Promise.all(
            product.reviews?.slice(0, 5).map((r) =>
                fetch(`${API_URL}${r['@id']}`).then((res) => res.json())
            ) ?? []
        ),
        fetch(`${API_URL}/api/v2/shop/product-association-types`).then((r) => r.json()),
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

    const associationsDataRaw = await Promise.all(
        associationTypes['hydra:member'].map(async (type: any) => {
            const assocRes = await fetch(
                `${API_URL}/api/v2/shop/products?association[ownerCode]=${code}&association[typeCode]=${type.code}`
            );
            const assocJson = await assocRes.json();
            return {
                title: type.name,
                products: assocJson['hydra:member'] ?? [],
            };
        })
    );

    const associationsData = associationsDataRaw.filter(a => a.products.length > 0);

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
