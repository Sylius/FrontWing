import type { I18nBootstrap } from "~/i18n";

declare global {
    interface Window {
        ENV: {
            API_URL?: string;
            JWT?: string;
        };
        __I18N__?: I18nBootstrap;
    }
}

export {};
