import type { ActionFunction } from "react-router";
import { data as routerData, redirect } from "react-router";
import { Form, useActionData, useNavigation } from "react-router";
import Default from "~/layouts/Default";
import AuthLeftPanel from "~/components/account/AuthLeftPanel";

interface ActionData {
    formError?: string;
    values?: { email: string };
}

export const action: ActionFunction = async ({ request }) => {
    const apiUrl = process.env.PUBLIC_API_URL;
    if (!apiUrl) {
        throw new Error("PUBLIC_API_URL is not defined");
    }

    const form = await request.formData();
    const email = form.get("email");
    if (typeof email !== "string" || !email) {
        return routerData({ formError: "Email is required." }, { status: 400 });
    }

    try {
        const res = await fetch(`${apiUrl}/api/v2/shop/customers/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ email }),
        });

        const text = await res.text();
        let data: any = {};
        try {
            data = text ? JSON.parse(text) : {};
        } catch {}

        if (!res.ok) {
            const msg = data.message || data.detail || "Failed to request password reset.";
            return routerData({ formError: msg, values: { email } }, { status: 400 });
        }

        return redirect("/login?resetRequested=true");
    } catch (e) {
        console.error("Reset password error:", e);
        return routerData({ formError: "An unexpected error occurred." }, { status: 500 });
    }
};

export default function ForgottenPasswordPage() {
    const actionData = useActionData<ActionData>();
    const navigation = useNavigation();
    const busy = navigation.state !== "idle";

    return (
        <Default>
            <div className="container my-auto">
                <div className="row my-4">
                    <AuthLeftPanel />
                    <div className="col-12 col-sm-10 offset-sm-1 col-md-8 offset-md-2 col-lg-6 offset-lg-0 col-xl-4 offset-xl-1 order-lg-1">
                        <div className="d-flex justify-content-center align-items-center h-100 px-3">
                            <div className="w-100 py-lg-5 mb-5 my-lg-5">
                                <h1 className="h2 mb-3">Reset password</h1>
                                <p className="mb-4">Set a new password for your account</p>

                                {actionData?.formError && (
                                    <div className="alert alert-danger">{actionData.formError}</div>
                                )}

                                <Form method="post" noValidate>
                                    <div className="mb-4">
                                        <label htmlFor="email" className="form-label required">
                                            Email <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            className="form-control"
                                            defaultValue={actionData?.values?.email}
                                        />
                                    </div>
                                    <div className="d-grid">
                                        <button type="submit" className="btn btn-primary" disabled={busy}>
                                            {busy ? "Sending..." : "Reset"}
                                        </button>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Default>
    );
}
