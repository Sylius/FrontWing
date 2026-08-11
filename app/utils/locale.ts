export const iriId = (iri: string): string =>
    iri.split("/").filter(Boolean).pop() ?? iri;

export const localeShortCode = (syliusLocale: string): string =>
    syliusLocale.split("_")[0].toLowerCase();

export const localeRegionCode = (syliusLocale: string): string =>
    syliusLocale.replace("_", "-").toLowerCase();

export interface LocaleMapper {
    toUrl: (syliusLocale: string) => string;
    toSylius: (urlSegment: string) => string;
    urlSegments: string[];
}

export const createLocaleMapper = (syliusLocales: string[]): LocaleMapper => {
    const shortCounts = new Map<string, number>();
    for (const locale of syliusLocales) {
        const short = localeShortCode(locale);
        shortCounts.set(short, (shortCounts.get(short) ?? 0) + 1);
    }

    const syliusToUrl = new Map<string, string>();
    const urlToSylius = new Map<string, string>();

    for (const locale of syliusLocales) {
        const short = localeShortCode(locale);
        const segment = shortCounts.get(short) === 1 ? short : localeRegionCode(locale);
        syliusToUrl.set(locale, segment);
        urlToSylius.set(segment, locale);
    }

    return {
        toUrl: (locale) => syliusToUrl.get(locale) ?? localeShortCode(locale),
        toSylius: (segment) => urlToSylius.get(segment) ?? segment,
        urlSegments: syliusLocales.map((locale) => syliusToUrl.get(locale) ?? localeShortCode(locale)),
    };
};
