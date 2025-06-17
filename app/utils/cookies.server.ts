// app/utils/cookies.server.ts
import { createCookie } from "@remix-run/node";

export const orderTokenCookie = createCookie("orderToken", {
    path: "/",
    httpOnly: false,
    sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
    secure: process.env.NODE_ENV !== "development",
    maxAge: 60 * 60 * 24 * 30,
});
