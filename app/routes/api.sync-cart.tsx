import { type ActionFunctionArgs } from "react-router";
import { serializeOrderToken } from "~/utils/orderTokenCookie";

export async function action({ request }: ActionFunctionArgs) {
    const token = await request.text();

    if (!token) {
        return Response.json({ success: false, message: "No token provided" }, { status: 400 });
    }

    return Response.json(
        { success: true },
        {
            headers: {
                "Set-Cookie": serializeOrderToken(token),
            },
        }
    );
}
