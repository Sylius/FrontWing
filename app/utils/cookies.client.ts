// app/utils/cookies.client.ts
import { orderTokenCookie as cookieFromServer } from "./cookies.server";

// tylko serialize potrzebne na kliencie (np. order.client.ts)
export const orderTokenCookie = {
    serialize: cookieFromServer.serialize,
};
