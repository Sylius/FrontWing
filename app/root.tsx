import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
    type LinksFunction,
    type LoaderFunction,
} from "react-router";

import { BootstrapLoader } from "~/components/helpers/BootstrapLoader";
import { OrderProvider } from "~/context/OrderContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CustomerProvider } from "~/context/CustomerContext";
import { FlashMessagesProvider } from "~/context/FlashMessagesContext";

import bootstrapStylesHref from "bootstrap/dist/css/bootstrap.css?url";
import mainStylesHref from "./assets/scss/main.scss?url";

import { orderTokenCookie } from "~/utils/cookies.server";
import type { Taxon } from "~/types/Taxon";

const queryClient = new QueryClient();

export const loader: LoaderFunction = async ({ request }) => {
    const cookieHeader = request.headers.get("Cookie");
    const parsed = await orderTokenCookie.parse(cookieHeader);
    const token = typeof parsed === "string" ? parsed : parsed?.token ?? "";

    const API_URL = process.env.PUBLIC_API_URL!;
    const res = await fetch(`${API_URL}/api/v2/shop/taxon-tree/category/branch`);
    const taxonTreeData = res.ok ? await res.json() : null;

    return {
        ENV: {
            API_URL,
        },
        orderToken: token || null,
        taxonTree: taxonTreeData?.["hydra:member"] ?? [],
    };
};

function EnvironmentScript({ env }: { env: Record<string, string | undefined> }) {
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: `window.ENV = ${JSON.stringify(env)};`,
            }}
        />
    );
}

function RemixOrderTokenScript({ token }: { token: string | null }) {
    if (!token) return null;
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: `window.__remixOrderToken = "${token}";`,
            }}
        />
    );
}

export const links: LinksFunction = () => [
    { rel: "stylesheet", href: bootstrapStylesHref },
    { rel: "stylesheet", href: mainStylesHref },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
    },
];

export default function App() {
    const data = useLoaderData<{
        ENV: Record<string, string>;
        orderToken: string | null;
        taxonTree: Taxon[];
    }>();

    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <meta name="apple-mobile-web-app-capable" content="yes"/>
            <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
            <meta name="apple-mobile-web-app-title" content="Sylius Demo"/>
            <link rel="manifest" href="/manifest.webmanifest"/>
            <link rel="apple-touch-icon" href="/logo192.png"/>
            <Meta/>
            <Links/>
        </head>

        <body>
        <BootstrapLoader/>
        <QueryClientProvider client={queryClient}>
            <CustomerProvider>
                <OrderProvider>
                    <FlashMessagesProvider>
                        <Outlet context={{taxonTree: data.taxonTree}}/>
                    </FlashMessagesProvider>
                </OrderProvider>
            </CustomerProvider>
        </QueryClientProvider>
        <ScrollRestoration/>
        <Scripts/>
        <EnvironmentScript env={data.ENV}/>
        <RemixOrderTokenScript token={data.orderToken}/>

        <script
            dangerouslySetInnerHTML={{
                __html: `
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
          navigator.serviceWorker.register('/service-worker.js')
            .then(function (registration) {
              console.log('ServiceWorker registered: ', registration);
            })
            .catch(function (error) {
              console.log('ServiceWorker registration failed: ', error);
            });
        });
      }
    `,
            }}
        />
        </body>
        </html>
    );
}
