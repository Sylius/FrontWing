import React, { createContext, useContext, useMemo } from "react";
import type { Channel } from "~/types/Channel";
import { localeRegionCode } from "~/utils/locale";

interface ChannelContextType {
    channelCode: string;
    locales: string[];
    defaultLocale: string;
    currencies: string[];
    baseCurrency: string;
    currentLocale: string;
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export const ChannelProvider: React.FC<{
    channel: Channel;
    currentLocale: string;
    children: React.ReactNode;
}> = ({ channel, currentLocale, children }) => {
    const value = useMemo<ChannelContextType>(
        () => ({
            channelCode: channel.code,
            locales: channel.locales,
            defaultLocale: channel.defaultLocale,
            currencies: channel.currencies,
            baseCurrency: channel.baseCurrency,
            currentLocale,
        }),
        [channel, currentLocale],
    );

    return <ChannelContext.Provider value={value}>{children}</ChannelContext.Provider>;
};

export const useChannel = (): ChannelContextType => {
    const context = useContext(ChannelContext);
    if (!context) {
        throw new Error("useChannel must be used within a ChannelProvider");
    }
    return context;
};

export const useLocales = () => {
    const { locales, defaultLocale, currentLocale } = useChannel();
    return { locales, defaultLocale, currentLocale };
};

export const useCurrency = () => {
    const { baseCurrency, currencies, currentLocale } = useChannel();

    const formatPrice = (priceInCents?: number): string => {
        if (priceInCents === undefined) return "-";
        return new Intl.NumberFormat(localeRegionCode(currentLocale), {
            style: "currency",
            currency: baseCurrency,
        }).format(priceInCents / 100);
    };

    return { baseCurrency, currencies, formatPrice };
};
