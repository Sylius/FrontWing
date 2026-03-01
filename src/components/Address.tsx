import React from "react";
import { Address } from "../types/Address";

interface AddressProps {
  sectionName: string;
  address: Address;
}

const BillingCard: React.FC<AddressProps> = ({ sectionName, address }) => {
  const fullName = `${address.firstName ?? ""} ${address.lastName ?? ""}`.trim();

  return (
    <div className="bg-muted/50 rounded-lg border-0">
      <div className="border-b px-4 py-3 font-medium">{sectionName}</div>
      <div className="p-4">
        <address className="flex flex-col not-italic">
          {address.company && <strong>{address.company}</strong>}
          <strong>{fullName}</strong>
          <span>{address.phoneNumber}</span>
          <span>{address.street}</span>
          <span>
            {address.city}, {address.postcode}
          </span>
          <span>{address.countryCode}</span>
        </address>
      </div>
    </div>
  );
};

export default BillingCard;
