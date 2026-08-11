import { createInstance, type i18n } from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { buildInitOptions, type I18nBootstrap } from "~/i18n";

export const createClientI18n = async (bootstrap: I18nBootstrap): Promise<i18n> => {
    const instance = createInstance();

    await instance
        .use(
            resourcesToBackend((lng: string, ns: string) =>
                fetch(`/locales/${lng}/${ns}.json`).then((res) => res.json()),
            ),
        )
        .use(initReactI18next)
        .init({
            ...buildInitOptions({
                lng: bootstrap.locale,
                supportedLngs: bootstrap.supportedLngs,
                fallbackLng: bootstrap.fallbackLng,
                ns: bootstrap.ns,
            }),
            partialBundledLanguages: true,
        });

    return instance;
};
