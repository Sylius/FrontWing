import type { Channel } from "~/types/Channel";
import { iriId } from "~/utils/locale";

const API_URL = process.env.PUBLIC_API_URL;
const CACHE_TTL_MS = 5 * 60 * 1000;

interface RawChannel {
    code: string;
    name: string;
    baseCurrency: string;
    defaultLocale: string;
    currencies: string[];
    locales: string[];
}

let cache: { channel: Channel; expiresAt: number } | null = null;

const normalizeChannel = (raw: RawChannel): Channel => ({
    code: raw.code,
    name: raw.name,
    baseCurrency: iriId(raw.baseCurrency),
    defaultLocale: iriId(raw.defaultLocale),
    currencies: raw.currencies.map(iriId),
    locales: raw.locales.map(iriId),
});

export const fetchChannel = async (): Promise<Channel> => {
    if (cache && cache.expiresAt > Date.now()) {
        return cache.channel;
    }

    const response = await fetch(`${API_URL}/api/v2/shop/channels`, {
        headers: { Accept: "application/ld+json" },
    });

    if (!response.ok) {
        const msg = await response.text();
        console.error("fetchChannel failed:", response.status, msg);
        throw new Error("Failed to fetch channel");
    }

    const data = await response.json();
    const raw: RawChannel | undefined = data["hydra:member"]?.[0];

    if (!raw) {
        console.error("fetchChannel failed: no channel in response");
        throw new Error("No channel returned from API");
    }

    const channel = normalizeChannel(raw);
    cache = { channel, expiresAt: Date.now() + CACHE_TTL_MS };
    return channel;
};
