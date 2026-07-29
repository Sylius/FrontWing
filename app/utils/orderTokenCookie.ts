const NAME = "orderToken";
const MAX_AGE = 60 * 60 * 24 * 30;

const attributes = (): string => {
    const secure = import.meta.env.PROD;
    const sameSite = secure ? "None" : "Lax";
    return `Path=/; Max-Age=${MAX_AGE}; SameSite=${sameSite}${secure ? "; Secure" : ""}`;
};

export const readOrderToken = (cookieHeader: string | null | undefined): string | null => {
    if (!cookieHeader) return null;
    for (const part of cookieHeader.split(";")) {
        const separator = part.indexOf("=");
        if (separator === -1) continue;
        if (part.slice(0, separator).trim() !== NAME) continue;
        const value = part.slice(separator + 1).trim();
        return value ? decodeURIComponent(value) : null;
    }
    return null;
};

export const serializeOrderToken = (token: string): string => `${NAME}=${token}; ${attributes()}`;

export const clearOrderTokenCookie = (): string => {
    const secure = import.meta.env.PROD;
    const sameSite = secure ? "None" : "Lax";
    return `${NAME}=; Path=/; Max-Age=0; SameSite=${sameSite}${secure ? "; Secure" : ""}`;
};
