import React from "react";
import { IconPhoto } from "@tabler/icons-react";
import type { OrderLineItem } from "~/modules/checkout-opc/types";
import { formatMoney } from "~/utils/price";

interface Props {
    item: OrderLineItem;
    currencyCode: string;
}

const OrderItemRow: React.FC<Props> = ({ item, currencyCode }) => (
    <div className="d-flex align-items-center gap-3 py-3">
        <div
            className="d-flex align-items-center justify-content-center flex-shrink-0 bg-white rounded overflow-hidden"
            style={{ width: "4rem", height: "4rem" }}
        >
            {item.imageUrl ? (
                <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="rounded"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
            ) : (
                <IconPhoto className="icon icon-md text-body-tertiary" stroke={2} />
            )}
        </div>

        <div className="flex-grow-1">
            <div className="h6 mb-1 text-break">{item.productName}</div>

            <div className="small">
                {item.quantity} × {formatMoney(item.unitPrice, currencyCode)}
                {item.originalUnitPrice !== undefined && (
                    <del className="text-body-tertiary ms-2">
                        {formatMoney(item.originalUnitPrice, currencyCode)}
                    </del>
                )}
            </div>
        </div>
    </div>
);

export default OrderItemRow;
