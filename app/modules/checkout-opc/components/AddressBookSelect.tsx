import React from "react";
import type { AddressInterface } from "~/types/Order";

interface Props {
    id: string;
    label: string;
    addresses: AddressInterface[];
    selectedId?: number;
    onSelect: (address: AddressInterface) => void;
}

const AddressBookSelect: React.FC<Props> = ({ id, label, addresses, selectedId, onSelect }) => {
    if (addresses.length === 0) return null;

    return (
        <div className="mb-3">
            <label className="form-label" htmlFor={id}>
                {label}
            </label>
            <select
                id={id}
                className="form-select"
                value={selectedId ?? ""}
                onChange={(event) => {
                    const found = addresses.find(
                        (address) => String(address.id) === event.target.value,
                    );
                    if (found) onSelect(found);
                }}
            >
                <option value="">Select</option>
                {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                        {address.firstName} {address.lastName} — {address.street}, {address.city}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default AddressBookSelect;
