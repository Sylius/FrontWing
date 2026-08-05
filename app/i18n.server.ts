import { readFile } from "node:fs/promises";
import path from "node:path";
import { createInstance, type i18n, type Resource, type TFunction } from "i18next";
import { initReactI18next } from "react-i18next";
import type { Channel } from "~/types/Channel";
import { buildInitOptions, NAMESPACES } from "~/i18n";
import { createLocaleMapper, localeRegionCode, localeShortCode } from "~/utils/locale";

const localesDir = path.resolve(process.cwd(), "public/locales");
const resourceCache = new Map<string, Record<string, unknown>>();

const loadNamespace = async (lng: string, ns: string): Promise<Record<string, unknown>> => {
    const cacheKey = `${lng}/${ns}`;
    const cached = resourceCache.get(cacheKey);
    if (cached) return cached;

    const filePath = path.join(localesDir, lng, `${ns}.json`);
    const parsed = JSON.parse(await readFile(filePath, "utf-8"));
    resourceCache.set(cacheKey, parsed);
    return parsed;
};

export const loadResources = async (
    lngs: string[],
    namespaces: readonly string[] = NAMESPACES
): Promise<Resource> => {
    const resources: Resource = {};
    for (const l of Array.from(new Set(lngs))) {
        resources[l] = {};
        for (const ns of namespaces) {
            resources[l][ns] = await loadNamespace(l, ns);
        }
    }
    return resources;
};

interface CreateInstanceArgs {
    lng: string;
    supportedLngs: string[];
    fallbackLng: string;
    namespaces?: readonly string[];
}

export const createI18nInstance = async ({
    lng,
    supportedLngs,
    fallbackLng,
    namespaces = NAMESPACES,
}: CreateInstanceArgs): Promise<{ instance: i18n; t: TFunction; resources: Resource }> => {
    const instance = createInstance();

    const resources = await loadResources([lng, fallbackLng], namespaces);

    await instance.use(initReactI18next).init({
        ...buildInitOptions({ lng, supportedLngs, fallbackLng, ns: namespaces }),
        resources,
    });

    return { instance, t: instance.getFixedT(lng), resources };
};

const parseAcceptLanguage = (header: string | null): string[] => {
    if (!header) return [];
    return header
        .split(",")
        .map((part) => {
            const [tag, q] = part.trim().split(";q=");
            return { tag: tag.toLowerCase(), q: q ? parseFloat(q) : 1 };
        })
        .filter((entry) => entry.tag && entry.tag !== "*")
        .sort((a, b) => b.q - a.q)
        .map((entry) => entry.tag);
};

const matchAcceptLanguage = (request: Request, channel: Channel): string | null => {
    const requested = parseAcceptLanguage(request.headers.get("Accept-Language"));

    for (const tag of requested) {
        const exact = channel.locales.find((locale) => localeRegionCode(locale) === tag);
        if (exact) return exact;

        const short = tag.split("-")[0];
        const byShort = channel.locales.find((locale) => localeShortCode(locale) === short);
        if (byShort) return byShort;
    }

    return null;
};

export interface ResolvedLocale {
    urlLocale: string;
    syliusLocale: string;
}

export const resolveLocale = (request: Request, channel: Channel): ResolvedLocale => {
    const mapper = createLocaleMapper(channel.locales);
    const firstSegment = new URL(request.url).pathname.split("/").filter(Boolean)[0];

    if (firstSegment && mapper.urlSegments.includes(firstSegment)) {
        return { urlLocale: firstSegment, syliusLocale: mapper.toSylius(firstSegment) };
    }

    const syliusLocale = matchAcceptLanguage(request, channel) ?? channel.defaultLocale;
    return { urlLocale: mapper.toUrl(syliusLocale), syliusLocale };
};
