import { useState } from "react";
import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    redirect,
    useLoaderData,
    useMatches,
    type LinksFunction,
    type LoaderFunction,
} from "react-router";

import { BootstrapLoader } from "~/components/helpers/BootstrapLoader";
import { OrderProvider } from "~/context/OrderContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CustomerProvider } from "~/context/CustomerContext";
import { FlashMessagesProvider } from "~/context/FlashMessagesContext";
import { ChannelProvider } from "~/context/ChannelContext";

import bootstrapStylesHref from "bootstrap/dist/css/bootstrap.css?url";
import mainStylesHref from "./assets/scss/main.scss?url";

import { orderTokenCookie } from "~/utils/cookies.server";
import type { Taxon } from "~/types/Taxon";
import type { Channel } from "~/types/Channel";
import { fetchChannel } from "~/api/channel.server";
import { resolveLocale } from "~/i18n.server";
import { createLocaleMapper } from "~/utils/locale";
import { collectNamespaces, extractResources, type I18nBootstrap, type I18nMeta } from "~/i18n";
import { useChangeLanguage } from "~/hooks/useChangeLanguage";
import { useTranslation } from "react-i18next";

export const handle = { i18n: ["common"] };

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\.data$/, "");

    const channel = await fetchChannel();
    const mapper = createLocaleMapper(channel.locales);
    const firstSegment = pathname.split("/").filter(Boolean)[0];

    if (!firstSegment || !mapper.urlSegments.includes(firstSegment)) {
        const { urlLocale } = resolveLocale(request, channel);
        const suffix = pathname === "/" ? "" : pathname;
        throw redirect(`/${urlLocale}${suffix}${url.search}`);
    }

    const locale = firstSegment;
    const fallbackLng = mapper.toUrl(channel.defaultLocale);

    const pathWithoutLang = pathname.slice(locale.length + 1) || "";
    const canonical = `${url.origin}/${locale}${pathWithoutLang}`;
    const alternates = [
        ...mapper.urlSegments.map((segment) => ({
            hrefLang: segment,
            href: `${url.origin}/${segment}${pathWithoutLang}`,
        })),
        { hrefLang: "x-default", href: `${url.origin}/${fallbackLng}${pathWithoutLang}` },
    ];

    const cookieHeader = request.headers.get("Cookie");
    const parsed = await orderTokenCookie.parse(cookieHeader);
    const token = typeof parsed === "string" ? parsed : parsed?.token ?? "";

    const API_URL = process.env.PUBLIC_API_URL!;
    const taxonTreeData = await fetch(
        `${API_URL}/api/v2/shop/taxon-tree/category/branch`,
    ).then((res) => (res.ok ? res.json() : null));

    return {
        ENV: {
            API_URL,
        },
        orderToken: token || null,
        taxonTree: taxonTreeData?.["hydra:member"] ?? [],
        channel,
        seo: { canonical, alternates },
        i18n: {
            locale,
            supportedLngs: mapper.urlSegments,
            fallbackLng,
        } satisfies I18nMeta,
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

function I18nBootstrapScript({ bootstrap }: { bootstrap: I18nBootstrap }) {
    const json = JSON.stringify(bootstrap).replace(/</g, "\\u003c");
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: `window.__I18N__ = ${json};`,
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
        channel: Channel;
        seo: { canonical: string; alternates: { hrefLang: string; href: string }[] };
        i18n: I18nMeta;
    }>();

    const matches = useMatches();
    const { i18n } = useTranslation();
    const [queryClient] = useState(() => new QueryClient());

    useChangeLanguage(data.i18n.locale);

    const namespaces = collectNamespaces(matches);
    const i18nBootstrap: I18nBootstrap = {
        ...data.i18n,
        ns: namespaces,
        resources: extractResources(
            i18n.store.data,
            [data.i18n.locale, data.i18n.fallbackLng],
            namespaces,
        ),
    };

    return (
        <html lang={data.i18n.locale}>
        <head>
            <meta charSet="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <meta name="apple-mobile-web-app-capable" content="yes"/>
            <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
            <meta name="apple-mobile-web-app-title" content="Sylius Demo"/>
            <link rel="manifest" href="/manifest.webmanifest"/>
            <link rel="apple-touch-icon" href="/logo192.png"/>
            <link rel="canonical" href={data.seo.canonical}/>
            {data.seo.alternates.map((alt) => (
                <link key={alt.hrefLang} rel="alternate" hrefLang={alt.hrefLang} href={alt.href}/>
            ))}
            <Meta/>
            <Links/>
        </head>

        <body>
        <BootstrapLoader/>
        <ChannelProvider channel={data.channel} currentLocale={data.i18n.locale}>
            <QueryClientProvider client={queryClient}>
                <CustomerProvider>
                    <OrderProvider>
                        <FlashMessagesProvider>
                            <Outlet context={{taxonTree: data.taxonTree}}/>
                        </FlashMessagesProvider>
                    </OrderProvider>
                </CustomerProvider>
            </QueryClientProvider>
        </ChannelProvider>
        <I18nBootstrapScript bootstrap={i18nBootstrap}/>
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
