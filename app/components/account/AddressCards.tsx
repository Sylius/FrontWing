import React from "react";
import { useTranslation } from "react-i18next";
import { LocalizedLink } from "~/components/LocalizedLink";
import { IconPencil, IconTrash } from "@tabler/icons-react";

import { Address } from "../../types/Address";
import { useCustomer } from "../../context/CustomerContext";
import { useFlashMessages } from "../../context/FlashMessagesContext";

interface AddressCardsProps {
    addresses: Address[];
    onDelete: (id: number) => void;
    refetchAddresses: () => void;
}

const AddressCards: React.FC<AddressCardsProps> = ({
                                                       addresses,
                                                       onDelete,
                                                       refetchAddresses,
                                                   }) => {
    const { t } = useTranslation("account");
    const { customer, refetchCustomer } = useCustomer();
    const { addMessage } = useFlashMessages();

    const handleSetDefault = async (addressId: number) => {
        if (!customer || !customer["@id"]) return;

        try {
            const token = localStorage.getItem("jwtToken");
            const response = await fetch(
                `${window.ENV?.API_URL}${customer["@id"]}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        ...customer,
                        defaultAddress: `/api/v2/shop/addresses/${addressId}`,
                    }),
                }
            );

            if (!response.ok) throw new Error("Failed to set default address");

            addMessage("success", t("addresses.card.setDefaultSuccess"));
            refetchCustomer();
            refetchAddresses();
        } catch (err) {
            console.error(err);
            addMessage("error", t("addresses.card.setDefaultError"));
        }
    };

    const defaultId = (() => {
        const def = customer?.defaultAddress;
        if (typeof def === "string") return def.split("/").pop() || null;
        if (def && typeof def === "object" && typeof def["@id"] === "string") {
            return def["@id"].split("/").pop() || null;
        }
        return null;
    })();

    return (
        <div className="row">
            {addresses.map((address) => (
                <div key={address.id} className="card border-0 bg-body-tertiary mb-3">
                    <div className="card-body">
                        {String(address.id) === defaultId && (
                            <div className="badge bg-primary text-white mb-3">
                                {t("addresses.card.default")}
                            </div>
                        )}

                        <div className="d-flex flex-column mb-4">
                            {address.company && <strong>{address.company}</strong>}
                            <div>
                                <strong className="fw-bold mb-1">{address.firstName} </strong>
                                <strong className="fw-bold mb-2">{address.lastName}</strong>
                            </div>
                            {address.phoneNumber && <strong>{address.phoneNumber}</strong>}
                            <span className="mb-1">{address.street}</span>
                            <span>{address.postcode}, {address.city}</span>
                            {address.provinceName && <span>{address.provinceName}</span>}
                            <span>{address.countryCode}</span>
                        </div>

                        <div className="d-flex flex-column flex-sm-row gap-2">
                            <LocalizedLink
                                to={`/account/address-book/edit/${address.id}`}
                                className="btn btn-sm btn-icon btn-outline-gray"
                            >
                                <IconPencil stroke={2} size={16} />
                                {t("addresses.card.edit")}
                            </LocalizedLink>

                            <button
                                className="btn btn-sm btn-icon btn-outline-danger w-full"
                                onClick={() => onDelete(address.id!)}
                            >
                                <IconTrash stroke={2} size={16} />
                                {t("addresses.card.delete")}
                            </button>

                            {String(address.id) !== defaultId && (
                                <button
                                    className="btn btn-sm btn-icon btn-outline-gray w-full"
                                    onClick={() => handleSetDefault(address.id!)}
                                >
                                    {t("addresses.card.setDefault")}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AddressCards;
