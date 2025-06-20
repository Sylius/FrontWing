import { createCookieSessionStorage } from "@remix-run/node";

const flashCookie = createCookieSessionStorage({
    cookie: {
        name: "__flash",
        sameSite: "lax",
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        secrets: ["super-secret-flash"],
        maxAge: 60,
    },
});

export async function getFlashSession(cookieHeader: string | null) {
    const session = await flashCookie.getSession(cookieHeader);
    return session;
}

export const commitFlashSession = flashCookie.commitSession;
export const destroyFlashSession = flashCookie.destroySession;
