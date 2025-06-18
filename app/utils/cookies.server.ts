// app/utils/cookies.server.ts
import { createCookie } from "@remix-run/node";

export const orderTokenCookie = createCookie("orderToken", {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 dni
});
