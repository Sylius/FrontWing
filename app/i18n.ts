import type { InitOptions } from "i18next";

export const NAMESPACES = ["common", "product", "cart", "checkout", "account"] as const;
export type Namespace = (typeof NAMESPACES)[number];

export const DEFAULT_NS: Namespace = "common";

export interface I18nMeta {
    locale: string;
    supportedLngs: string[];
    fallbackLng: string;
}

export interface I18nBootstrap extends I18nMeta {
    ns: string[];
}

const readHandleNamespaces = (handle: unknown): string[] => {
    const i18n = (handle as { i18n?: string | string[] } | undefined)?.i18n;
    if (!i18n) return [];
    return Array.isArray(i18n) ? i18n : [i18n];
};

export const collectNamespaces = (
    matches: ReadonlyArray<{ handle?: unknown; route?: { handle?: unknown } }>,
): string[] => {
    const namespaces = matches.flatMap((match) =>
        readHandleNamespaces(match.route ? match.route.handle : match.handle),
    );
    return [...new Set([DEFAULT_NS, ...namespaces])];
};

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
