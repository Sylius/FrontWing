import type { InitOptions, Resource } from "i18next";

export const NAMESPACES = ["common", "product", "cart", "checkout", "account"] as const;
export type Namespace = (typeof NAMESPACES)[number];

export const DEFAULT_NS: Namespace = "common";

export interface I18nBootstrap {
    locale: string;
    supportedLngs: string[];
    fallbackLng: string;
    resources: Resource;
}

export interface I18nRuntimeOptions {
    lng: string;
    supportedLngs: string[];
    fallbackLng: string;
    ns?: readonly string[];
}

export const buildInitOptions = ({
    lng,
    supportedLngs,
    fallbackLng,
    ns = NAMESPACES,
}: I18nRuntimeOptions): InitOptions => ({
    lng,
    supportedLngs,
    fallbackLng,
    defaultNS: DEFAULT_NS,
    ns: [...ns],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
});
