import React from "react";
import { Link } from "react-router-dom";
import { IconPencil, IconTrash } from "@tabler/icons-react";

import { Address } from "../../types/Address";
import { useCustomer } from "../../context/CustomerContext";
import { useFlashMessages } from "../../context/FlashMessagesContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AddressCardsProps {
  addresses: Address[];
  onDelete: (id: number) => void;
  refetchAddresses: () => void;
}

const AddressCards: React.FC<AddressCardsProps> = ({ addresses, onDelete, refetchAddresses }) => {
  const { customer, refetchCustomer } = useCustomer();
  const { addMessage } = useFlashMessages();

  const handleSetDefault = async (addressId: number) => {
    if (!customer || !customer["@id"]) return;

    try {
      const token = localStorage.getItem("jwtToken");
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}${customer["@id"]}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...customer,
          defaultAddress: `/api/v2/shop/addresses/${addressId}`,
        }),
      });

      if (!response.ok) throw new Error("Failed to set default address");

      addMessage("success", "Default address updated");
      refetchCustomer();
      refetchAddresses();
    } catch (err) {
      console.error(err);
      addMessage("error", "Failed to update default address");
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
    <div className="-mx-4 flex flex-wrap">
      {addresses.map((address) => (
        <div key={address.id} className="bg-muted/50 mb-3 w-full rounded-lg border-0 px-4">
          <div className="p-4">
            {String(address.id) === defaultId && (
              <Badge className="mb-3">Your default address</Badge>
            )}

            <div className="mb-4 flex flex-col">
              {address.company && <strong>{address.company}</strong>}
              <div>
                <strong className="mb-1 font-bold">{address.firstName} </strong>
                <strong className="mb-2 font-bold">{address.lastName}</strong>
              </div>
              {address.phoneNumber && <strong>{address.phoneNumber}</strong>}
              <span className="mb-1">{address.street}</span>
              <span>
                {address.postcode}, {address.city}
              </span>
              {address.provinceName && <span>{address.provinceName}</span>}
              <span>{address.countryCode}</span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                size="sm"
                render={<Link to={`/account/address-book/edit/${address.id}`} />}
              >
                <IconPencil stroke={2} size={16} />
                Edit
              </Button>

              <Button variant="destructive" size="sm" onClick={() => onDelete(address.id!)}>
                <IconTrash stroke={2} size={16} />
                Delete
              </Button>

              {String(address.id) !== defaultId && (
                <Button variant="outline" size="sm" onClick={() => handleSetDefault(address.id!)}>
                  Set as default
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AddressCards;
