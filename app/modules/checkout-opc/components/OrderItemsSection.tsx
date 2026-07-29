import React from "react";
import type { OrderLineItem } from "~/modules/checkout-opc/types";
import OrderItemRow from "./OrderItemRow";

interface Props {
    items: OrderLineItem[];
    currencyCode: string;
}

const OrderItemsSection: React.FC<Props> = ({ items, currencyCode }) => {
    return (
        <section aria-label="Your order">
            {items.length === 0 ? (
                <p className="text-body-tertiary mb-0">Your cart is empty.</p>
            ) : (
                <div className="overflow-y-auto" style={{ maxHeight: "24rem" }}>
                    {items.map((item, index) => (
                        <div key={item.id} className={index > 0 ? "border-top" : undefined}>
                            <OrderItemRow item={item} currencyCode={currencyCode} />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default OrderItemsSection;
