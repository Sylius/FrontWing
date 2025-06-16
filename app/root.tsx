import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
} from "@remix-run/react";
import {
    json,
    type LinksFunction,
    type LoaderFunction,
} from "@remix-run/node";

import { BootstrapLoader } from "~/components/helpers/BootstrapLoader";
import { OrderProvider } from "~/context/OrderContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CustomerProvider } from "~/context/CustomerContext";
import { FlashMessagesProvider } from "~/context/FlashMessagesContext";

import bootstrapStylesHref from "bootstrap/dist/css/bootstrap.css?url";
import mainStylesHref from "./assets/scss/main.scss?url";

const queryClient = new QueryClient();

export const loader: LoaderFunction = async () => {
    return json({
        ENV: {
            API_URL: process.env.PUBLIC_API_URL,
        },
    });
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
    const data = useLoaderData<{ ENV: Record<string, string> }>();

    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <Meta />
            <Links />
        </head>
        <body>
        <BootstrapLoader />
        <QueryClientProvider client={queryClient}>
            <CustomerProvider>
                <OrderProvider>
                    <FlashMessagesProvider>
                        <Outlet />
                    </FlashMessagesProvider>
                </OrderProvider>
            </CustomerProvider>
        </QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
        <EnvironmentScript env={data.ENV} />
        </body>
        </html>
    );
}
