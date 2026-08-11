import { useCallback } from "react";
import { useParams } from "react-router";
import { localizePath } from "~/utils/localizedPath";

export const useLocalizedHref = (): ((path: string) => string) => {
    const { lang } = useParams();

    return useCallback(
        (path: string) => (lang ? localizePath(lang, path) : path),
        [lang],
    );
};
