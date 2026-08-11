export const localizePath = (lang: string, path: string): string => {
    if (!path.startsWith("/")) return path;
    if (path === "/") return `/${lang}`;
    return `/${lang}${path}`;
};
