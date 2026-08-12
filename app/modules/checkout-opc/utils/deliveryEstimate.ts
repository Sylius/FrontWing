import type { DeliveryEstimate } from "~/modules/checkout-opc/types";

const dayFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", timeZone: "UTC" });
const monthFormat = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" });
const yearFormat = new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: "UTC" });

const formatDeliveryRange = (estimate: DeliveryEstimate): string => {
    const from = new Date(estimate.from);
    const to = new Date(estimate.to);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return "";

    const sameYear = from.getUTCFullYear() === to.getUTCFullYear();
    const sameMonth = sameYear && from.getUTCMonth() === to.getUTCMonth();

    if (sameMonth) {
        return `${dayFormat.format(from)} - ${dayFormat.format(to)} ${monthFormat.format(to)}, ${yearFormat.format(to)}`;
    }

    if (sameYear) {
        return `${dayFormat.format(from)} ${monthFormat.format(from)} - ${dayFormat.format(to)} ${monthFormat.format(to)}, ${yearFormat.format(to)}`;
    }

    return `${dayFormat.format(from)} ${monthFormat.format(from)}, ${yearFormat.format(from)} - ${dayFormat.format(to)} ${monthFormat.format(to)}, ${yearFormat.format(to)}`;
};

export { formatDeliveryRange };
