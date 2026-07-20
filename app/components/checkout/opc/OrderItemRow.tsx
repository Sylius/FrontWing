import React from "react";
import { IconPhoto, IconX } from "@tabler/icons-react";
import type { OrderLineItem } from "~/types/Checkout";
import { formatMoney } from "~/utils/price";

interface Props {
    item: OrderLineItem;
    currencyCode: string;
    onRemove: () => void;
}

const OrderItemRow: React.FC<Props> = ({ item, currencyCode, onRemove }) => (
    <div className="d-flex align-items-start gap-3 py-3">
        <div
            className="d-flex align-items-center justify-content-center flex-shrink-0 bg-white rounded"
            style={{ width: "4rem", height: "4rem" }}
        >
            {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.productName} className="img-fluid rounded" />
            ) : (
                <IconPhoto className="icon icon-md text-body-tertiary" stroke={2} />
            )}
        </div>

        <div className="flex-grow-1">
            <div className="h6 mb-1 text-break">{item.productName}</div>

            {item.options?.map((option) => (
                <div key={option.name} className="text-body-tertiary small">
                    {option.name}: {option.value}
                </div>
            ))}

            <div className="small">
                {item.quantity} × {formatMoney(item.unitPrice, currencyCode)}
                {item.originalUnitPrice !== undefined && (
                    <del className="text-body-tertiary ms-2">
                        {formatMoney(item.originalUnitPrice, currencyCode)}
                    </del>
                )}
            </div>
        </div>

        <button
            type="button"
            className="btn btn-sm btn-transparent px-2 flex-shrink-0"
            aria-label={`Remove ${item.productName}`}
            onClick={onRemove}
        >
            <IconX className="icon icon-sm" stroke={2} />
        </button>
    </div>
);

export default OrderItemRow;
