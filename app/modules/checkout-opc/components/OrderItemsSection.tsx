import React from "react";
import { useTranslation } from "react-i18next";
import type { OrderLineItem } from "~/modules/checkout-opc/types";
import OrderItemRow from "./OrderItemRow";

interface Props {
    items: OrderLineItem[];
    currencyCode: string;
}

const OrderItemsSection: React.FC<Props> = ({ items, currencyCode }) => {
    const { t } = useTranslation("checkout");

    return (
        <section aria-label={t("opc.items.ariaLabel")}>
            {items.length === 0 ? (
                <p className="text-body-tertiary mb-0">{t("opc.items.empty")}</p>
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
