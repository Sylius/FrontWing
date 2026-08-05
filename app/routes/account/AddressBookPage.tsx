import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Default from "../../layouts/Default";
import AccountLayout from "../../layouts/Account";
import { LocalizedLink } from "~/components/LocalizedLink";
import { Address } from "../../types/Address";
import { useCustomer } from "../../context/CustomerContext";
import { useFlashMessages } from "../../context/FlashMessagesContext";
import AddressCards from "../../components/account/AddressCards";
import Skeleton from "react-loading-skeleton";

const getDefaultAddressId = (
    defaultAddress?: string | { "@id": string } | null
): string | null => {
    if (!defaultAddress) return null;
    const addressUrl = typeof defaultAddress === "string" ? defaultAddress : defaultAddress["@id"];
    return addressUrl.split("/").pop() || null;
};


const AddressBookPage: React.FC = () => {
    const { t } = useTranslation(["account", "common"]);
    const { customer } = useCustomer();
    const { addMessage } = useFlashMessages();

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("jwtToken");
            const res = await fetch(
                `${window.ENV?.API_URL}/api/v2/shop/addresses`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) throw new Error("Failed to fetch addresses");

            const data = await res.json();
            setAddresses(data["hydra:member"] || []);
        } catch (err) {
            console.error("Error loading addresses", err);
            addMessage("error", t("addresses.book.loadError"));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const token = localStorage.getItem("jwtToken");
            const res = await fetch(
                `${window.ENV?.API_URL}/api/v2/shop/addresses/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) throw new Error("Failed to delete address");

            addMessage("success", t("addresses.book.deleteSuccess"));
            fetchAddresses();
        } catch (err) {
            console.error("Error deleting address", err);
            addMessage("error", t("addresses.book.deleteError"));
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const defaultId = getDefaultAddressId(customer?.defaultAddress);

    const sortedAddresses = [...addresses].sort((a, b) => {
        if (String(a.id) === defaultId) return -1;
        if (String(b.id) === defaultId) return 1;
        return 0;
    });

    return (
        <Default>
            <AccountLayout
                breadcrumbs={[
                    { label: t("common:nav.home"), url: "/" },
                    { label: t("common:nav.account"), url: "/account/dashboard" },
                    { label: t("addresses.breadcrumb"), url: "/account/address-book" },
                ]}
            >
                <div className="col-12 col-md-9">
                    <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                            <h1 className="mb-1">{t("addresses.book.title")}</h1>
                            <div className="text-muted">{t("addresses.book.subtitle")}</div>
                        </div>
                        <LocalizedLink to="/account/address-book/add" className="btn btn-primary">
                            {t("addresses.book.add")}
                        </LocalizedLink>
                    </div>

                    {loading ? (
                        <Skeleton count={3} height={120} className="mb-3" />
                    ) : addresses.length === 0 ? (
                        <div className="alert alert-info">
                            <div className="fw-bold">{t("addresses.book.infoTitle")}</div>
                            {t("addresses.book.empty")}
                        </div>
                    ) : (
                        <AddressCards
                            addresses={sortedAddresses}
                            onDelete={handleDelete}
                            refetchAddresses={fetchAddresses}
                        />
                    )}
                </div>
            </AccountLayout>
        </Default>
    );
};

export default AddressBookPage;
