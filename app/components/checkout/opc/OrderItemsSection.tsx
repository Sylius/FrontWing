import React from "react";
import type { OrderLineItem } from "~/types/Checkout";
import { useCheckout } from "~/context/CheckoutContext";
import OrderItemRow from "./OrderItemRow";

interface Props {
    items: OrderLineItem[];
    currencyCode: string;
}

const OrderItemsSection: React.FC<Props> = ({ items, currencyCode }) => {
    const { state, removeItem } = useCheckout();

    // `items` is the catalog (names, images, prices); the reducer owns quantity and presence.
    const catalog = new Map(items.map((item) => [item.id, item]));
    const lines = state.items
        .map(({ id, quantity }) => {
            const line = catalog.get(id);
            return line ? { ...line, quantity } : null;
        })
        .filter((line): line is OrderLineItem => line !== null);

    return (
        <section aria-label="Your order">
            {lines.length === 0 ? (
                <p className="text-body-tertiary mb-0">Your cart is empty.</p>
            ) : (
                lines.map((item, index) => (
                    <div key={item.id} className={index > 0 ? "border-top" : undefined}>
                        <OrderItemRow
                            item={item}
                            currencyCode={currencyCode}
                            onRemove={() => removeItem(item.id)}
                        />
                    </div>
                ))
            )}
        </section>
    );
};

export default OrderItemsSection;
