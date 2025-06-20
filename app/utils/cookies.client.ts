import { orderTokenCookie as cookieFromServer } from "./cookies.server";

export const orderTokenCookie = {
    serialize: cookieFromServer.serialize,
};
