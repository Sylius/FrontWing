import React from "react";
import type { OrderLineItem } from "~/types/Checkout";
import OrderItemRow from "./OrderItemRow";

interface Props {
    items: OrderLineItem[];
    currencyCode: string;
}

const OrderItemsSection: React.FC<Props> = ({ items, currencyCode }) => (
    <section aria-label="Your order">
        {items.length === 0 ? (
            <p className="text-body-tertiary mb-0">Your cart is empty.</p>
        ) : (
            items.map((item, index) => (
                <div key={item.id} className={index > 0 ? "border-top" : undefined}>
                    <OrderItemRow item={item} currencyCode={currencyCode} />
                </div>
            ))
        )}
    </section>
);

export default OrderItemsSection;
