import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const useChangeLanguage = (locale: string): void => {
    const { i18n } = useTranslation();

    useEffect(() => {
        if (i18n.language !== locale) {
            i18n.changeLanguage(locale);
        }
    }, [i18n, locale]);
};
