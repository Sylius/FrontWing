import React, { useState } from "react";
import type { AddressInterface } from "~/types/Order";
import type { AddressFieldName, Country } from "~/modules/checkout-opc/types";
import AddressFields from "./AddressFields";

interface Props {
    idPrefix: string;
    addresses: AddressInterface[];
    countries: Country[];
    address: AddressInterface;
    onSelect: (address: AddressInterface) => void;
    onChange: (field: AddressFieldName, value: string) => void;
}

const AddressBook: React.FC<Props> = ({
    idPrefix,
    addresses,
    countries,
    address,
    onSelect,
    onChange,
}) => {
    const matchesBook = (candidate: AddressInterface): boolean =>
        addresses.some((entry) => entry.id === candidate.id);

    // Start in manual mode whenever the current address isn't a book entry —
    // e.g. an empty shipping address or a restored custom-typed one.
    const [editing, setEditing] = useState(() => !matchesBook(address));

    // No saved addresses: nothing to pick from, go straight to the form.
    if (addresses.length === 0) {
        return (
            <AddressFields
                idPrefix={idPrefix}
                address={address}
                countries={countries}
                onChange={onChange}
            />
        );
    }

    return (
        <>
            <div className="mb-3">
                {addresses.map((entry) => {
                    const inputId = `${idPrefix}-book-${entry.id}`;
                    return (
                        <div className="form-check" key={entry.id}>
                            <input
                                id={inputId}
                                className="form-check-input"
                                type="radio"
                                name={`${idPrefix}-book`}
                                checked={!editing && address.id === entry.id}
                                onChange={() => {
                                    onSelect(entry);
                                    setEditing(false);
                                }}
                            />
                            <label className="form-check-label" htmlFor={inputId}>
                                {entry.firstName} {entry.lastName} — {entry.street}, {entry.city}
                            </label>
                        </div>
                    );
                })}
            </div>

            <div className="form-check mb-3">
                <input
                    id={`${idPrefix}-manual`}
                    className="form-check-input"
                    type="checkbox"
                    checked={editing}
                    onChange={(event) => {
                        const enabled = event.target.checked;
                        setEditing(enabled);
                        // Leaving manual mode with a custom-typed address: fall
                        // back to the first saved entry so a radio stays selected.
                        if (!enabled && !matchesBook(address)) onSelect(addresses[0]);
                    }}
                />
                <label className="form-check-label" htmlFor={`${idPrefix}-manual`}>
                    Enter address manually
                </label>
            </div>

            {editing && (
                <AddressFields
                    idPrefix={idPrefix}
                    address={address}
                    countries={countries}
                    onChange={onChange}
                />
            )}
        </>
    );
};

export default AddressBook;
