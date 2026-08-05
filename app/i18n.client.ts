import { createInstance, type i18n } from "i18next";
import { initReactI18next } from "react-i18next";
import { buildInitOptions, type I18nBootstrap } from "~/i18n";

export const createClientI18n = (bootstrap: I18nBootstrap): i18n => {
    const instance = createInstance();

    instance.use(initReactI18next).init({
        ...buildInitOptions({
            lng: bootstrap.locale,
            supportedLngs: bootstrap.supportedLngs,
            fallbackLng: bootstrap.fallbackLng,
        }),
        resources: bootstrap.resources,
    });

    return instance;
};
