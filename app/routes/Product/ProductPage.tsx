// routes/Product/ProductPage.tsx
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import ProductPage from '~/components/ProductPage';

export async function loader({ params }: LoaderFunctionArgs) {
    const code = params.code!;
    const API_URL = process.env.API_URL || 'http://localhost:8000';

    const res = await fetch(`${API_URL}/api/v2/shop/products/${code}`);
    if (!res.ok) throw new Response('Product not found', { status: 404 });

    const product = await res.json();
    return json({ product });
}

export default function ProductPageRoute() {
    const { product } = useLoaderData<typeof loader>();
    return <ProductPage product={product} />;
}
