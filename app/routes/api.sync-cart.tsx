import { json, type ActionFunctionArgs } from "@remix-run/node";
import { orderTokenCookie } from "~/utils/cookies.server";

export async function action({ request }: ActionFunctionArgs) {
    const token = await request.text();

    if (!token) {
        return json({ success: false, message: "No token provided" }, { status: 400 });
    }

    return json(
        { success: true },
        {
            headers: {
                "Set-Cookie": await orderTokenCookie.serialize(token),
            },
        }
    );
}
