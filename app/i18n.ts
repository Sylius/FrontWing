import type { InitOptions } from "i18next";

export const DEFAULT_NS = "translation";

export interface I18nRuntimeOptions {
    lng: string;
    supportedLngs: string[];
    fallbackLng: string;
}

export const buildInitOptions = ({
    lng,
    supportedLngs,
    fallbackLng,
}: I18nRuntimeOptions): InitOptions => ({
    lng,
    supportedLngs,
    fallbackLng,
    defaultNS: DEFAULT_NS,
    ns: [DEFAULT_NS],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
});
