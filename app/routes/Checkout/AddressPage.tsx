import {
    type LoaderFunctionArgs,
    type ActionFunctionArgs,
    redirect,
} from "react-router";
import {
    useLoaderData,
    Form,
    useNavigation,
} from "react-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import CheckoutLayout from "~/layouts/Checkout";
import Steps from "~/components/checkout/Steps";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useCustomer } from "~/context/CustomerContext";
import { useOrder } from "~/context/OrderContext";
import { LocalizedLink } from "~/components/LocalizedLink";
import { localizePath } from "~/utils/localizedPath";
import { orderTokenCookie } from "~/utils/cookies.server";
import { fetchOrderFromAPI } from "~/api/order.server";
import type { AddressInterface, Order } from "~/types/Order";
import type { Customer } from "~/types/Customer";

interface Country {
    code: string;
    name: string;
}

const emptyAddress: AddressInterface = {
    firstName: "",
    lastName: "",
    company: "",
    street: "",
    countryCode: "",
    city: "",
    postcode: "",
    phoneNumber: "",
};

export async function loader({ request, params }: LoaderFunctionArgs) {
    const cookie = request.headers.get("Cookie");
    const token = await orderTokenCookie.parse(cookie);
    if (!token) return redirect(localizePath(params.lang!, "/cart"));

    const order = await fetchOrderFromAPI(token, true);
    return { order, token };
}

export async function action({ request, params }: ActionFunctionArgs) {
    const form = await request.formData();
    const email = form.get("email")?.toString() ?? "";
    const token = form.get("token")?.toString() ?? "";
    const couponCode = form.get("couponCode")?.toString();
    const useDifferent = form.get("useDifferentShipping") === "on";

    const extract = (prefix: string): AddressInterface => ({
        firstName: form.get(`${prefix}_firstName`)?.toString() ?? "",
        lastName: form.get(`${prefix}_lastName`)?.toString() ?? "",
        company: form.get(`${prefix}_company`)?.toString() ?? "",
        street: form.get(`${prefix}_street`)?.toString() ?? "",
        countryCode: form.get(`${prefix}_countryCode`)?.toString() ?? "",
        provinceName: form.get(`${prefix}_provinceName`)?.toString() ?? "",
        city: form.get(`${prefix}_city`)?.toString() ?? "",
        postcode: form.get(`${prefix}_postcode`)?.toString() ?? "",
        phoneNumber: form.get(`${prefix}_phoneNumber`)?.toString() ?? "",
    });

    const billingAddress = extract("billing");
    const shippingAddress = useDifferent ? extract("shipping") : billingAddress;

    const payload = {
        email,
        billingAddress,
        shippingAddress,
        couponCode: couponCode && couponCode !== "__USED__" ? couponCode : undefined,
    };

    const res = await fetch(`${process.env.PUBLIC_API_URL}/api/v2/shop/orders/${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        return redirect(localizePath(params.lang!, "/checkout/address?error=1"));
    }

    return redirect(localizePath(params.lang!, "/checkout/select-shipping"));
}

export default function AddressPage() {
    const { t } = useTranslation("checkout");
    const { order, token } = useLoaderData<{ order: Order; token: string }>();
    const { customer } = useCustomer();
    const { activeCouponCode } = useOrder();
    const nav = useNavigation();
    const isSubmitting = nav.state === "submitting";

    const [email, setEmail] = useState("");
    const [billingAddress, setBillingAddress] = useState<AddressInterface>(emptyAddress);
    const [shippingAddress, setShippingAddress] = useState<AddressInterface>(emptyAddress);
    const [useDifferentShipping, setUseDifferentShipping] = useState(false);
    const [countries, setCountries] = useState<Country[]>([]);
    const [addressBook, setAddressBook] = useState<AddressInterface[]>([]);
    const [selectedBillingId, setSelectedBillingId] = useState<number | null>(null);
    const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const isInitialized = useRef(false);

    const API_URL = typeof window !== "undefined" ? window.ENV?.API_URL ?? "" : "";
    const JWT = typeof window !== "undefined" ? localStorage.getItem("jwtToken") ?? "" : "";

    useEffect(() => {
        if (!API_URL) return;

        Promise.all([
            fetch(`${API_URL}/api/v2/shop/countries`).then((res) => res.json()),
            JWT
                ? fetch(`${API_URL}/api/v2/shop/addresses`, {
                    headers: { Authorization: `Bearer ${JWT}` },
                }).then((res) => res.json())
                : Promise.resolve({ "hydra:member": [] }),
        ])
            .then(([countriesData, addressData]) => {
                setCountries(countriesData["hydra:member"] ?? []);
                setAddressBook(addressData["hydra:member"] ?? []);
            })
            .finally(() => setLoading(false));
    }, [API_URL, JWT]);

    useEffect(() => {
        if (!order || isInitialized.current) return;
        if (order.billingAddress) setBillingAddress(order.billingAddress);
        if (order.shippingAddress) {
            setUseDifferentShipping(true);
            setShippingAddress(order.shippingAddress);
        }
        isInitialized.current = true;
    }, [order]);

    useEffect(() => {
        if (customer && customer.email) {
            setEmail(customer.email);
        }
    }, [customer]);

    const handleChange =
        (setter: React.Dispatch<React.SetStateAction<AddressInterface>>) =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                const { name, value } = e.target;
                setter((prev) => ({ ...prev, [name.split("_")[1]]: value }));
            };

    const renderAddressForm = (
        prefix: string,
        address: AddressInterface,
        setAddress: React.Dispatch<React.SetStateAction<AddressInterface>>,
        selectedId: number | null,
        setSelectedId: React.Dispatch<React.SetStateAction<number | null>>
    ) => (
        <>
            {Array.isArray(addressBook) && addressBook.length > 0 && customer && (
                <div className="mb-3">
                    <select
                        className="form-select"
                        value={selectedId ?? ""}
                        onChange={(e) => {
                            const found = addressBook.find((a) => String(a.id) === e.target.value);
                            if (found) {
                                setAddress(found);
                                setSelectedId(Number(e.target.value));
                            }
                        }}
                    >
                        <option value="">{t("address.selectFromBook")}</option>
                        {addressBook.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.firstName} {a.lastName} — {a.street}, {a.city}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">{t("address.firstName")}</label>
                    <input name={`${prefix}_firstName`} className="form-control" required value={address.firstName} onChange={handleChange(setAddress)} />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">{t("address.lastName")}</label>
                    <input name={`${prefix}_lastName`} className="form-control" required value={address.lastName} onChange={handleChange(setAddress)} />
                </div>
            </div>
            <div className="mb-3">
                <label className="form-label">{t("address.company")}</label>
                <input name={`${prefix}_company`} className="form-control" value={address.company ?? ""} onChange={handleChange(setAddress)} />
            </div>
            <div className="mb-3">
                <label className="form-label">{t("address.street")}</label>
                <input name={`${prefix}_street`} className="form-control" required value={address.street} onChange={handleChange(setAddress)} />
            </div>
            <div className="mb-3">
                <label className="form-label">{t("address.country")}</label>
                <select name={`${prefix}_countryCode`} className="form-select" required value={address.countryCode}
                        onChange={handleChange(setAddress)}>
                    <option value="">{t("address.selectCountry")}</option>
                    {countries.map((c) => (
                        <option key={c.code} value={c.code}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">{t("address.province")}</label>
                <input
                    name={`${prefix}_provinceName`}
                    className="form-control"
                    value={address.provinceName ?? ""}
                    onChange={handleChange(setAddress)}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">{t("address.city")}</label>
                <input name={`${prefix}_city`} className="form-control" required value={address.city}
                       onChange={handleChange(setAddress)}/>
            </div>
            <div className="mb-3">
                <label className="form-label">{t("address.postcode")}</label>
                <input name={`${prefix}_postcode`} className="form-control" required value={address.postcode} onChange={handleChange(setAddress)} />
            </div>
            <div className="mb-4">
                <label className="form-label">{t("address.phone")}</label>
                <input name={`${prefix}_phoneNumber`} className="form-control" value={address.phoneNumber ?? ""} onChange={handleChange(setAddress)} />
            </div>
        </>
    );

    return (
        <CheckoutLayout>
            <div className="col pt-4 pb-5">
                <Steps activeStep="address" />
                {loading ? (
                    <div className="text-center py-5">{t("address.loading")}</div>
                ) : (
                    <Form method="post" replace={false}>
                        <input type="hidden" name="token" value={token} />
                        <input type="hidden" name="couponCode" value={activeCouponCode ?? ""} />
                        <input type="hidden" name="email" value={email} />

                        <div className="mb-4 h2">{t("address.title")}</div>

                        {!customer && (
                            <div className="mb-4">
                                <label className="form-label required">{t("address.email")}</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="form-control"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="mb-4">
                            <div className="h4 mb-4">{t("address.billingAddress")}</div>
                            {renderAddressForm("billing", billingAddress, setBillingAddress, selectedBillingId, setSelectedBillingId)}
                        </div>

                        <div className="form-check form-switch mb-4">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                name="useDifferentShipping"
                                checked={useDifferentShipping}
                                onChange={() => {
                                    const next = !useDifferentShipping;
                                    setUseDifferentShipping(next);
                                    if (next && !shippingAddress.firstName) {
                                        setShippingAddress({ ...billingAddress });
                                    }
                                }}
                                id="differentShipping"
                            />
                            <label className="form-check-label" htmlFor="differentShipping">
                                {t("address.useDifferentShipping")}
                            </label>
                        </div>

                        {useDifferentShipping && (
                            <div className="mb-4">
                                <div className="h4 mb-4">{t("address.shippingAddress")}</div>
                                {renderAddressForm("shipping", shippingAddress, setShippingAddress, selectedShippingId, setSelectedShippingId)}
                            </div>
                        )}

                        <div className="d-flex justify-content-between flex-column flex-sm-row gap-2">
                            <LocalizedLink className="btn btn-light btn-icon" to="/cart">
                                <IconChevronLeft stroke={2} />
                                {t("address.backToCart")}
                            </LocalizedLink>
                            <button type="submit" className="btn btn-primary btn-icon" disabled={isSubmitting}>
                                {t("address.next")}
                                <IconChevronRight stroke={2} />
                            </button>
                        </div>
                    </Form>
                )}
            </div>
        </CheckoutLayout>
    );
}
