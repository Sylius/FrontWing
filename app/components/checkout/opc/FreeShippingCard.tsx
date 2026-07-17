import React from "react";
import { IconTruck } from "@tabler/icons-react";
import type { FreeShippingProgress } from "~/types/Checkout";
import { formatMoney } from "~/utils/price";

interface Props {
    freeShipping: FreeShippingProgress;
    currencyCode: string;
}

const FreeShippingCard: React.FC<Props> = ({ freeShipping, currencyCode }) => (
    <div className="card bg-body-tertiary border-0">
        <div className="card-body">
            <div className="d-flex align-items-center gap-2 mb-3">
                <IconTruck className="icon icon-md flex-shrink-0" stroke={2} />
                <span>
                    Only {formatMoney(freeShipping.remaining, currencyCode)} away from free shipping!
                </span>
            </div>

            <div
                className="progress"
                role="progressbar"
                aria-label="Progress towards free shipping"
                aria-valuenow={freeShipping.progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div
                    className="progress-bar bg-primary"
                    style={{ width: `${freeShipping.progressPercent}%` }}
                />
            </div>
        </div>
    </div>
);

export default FreeShippingCard;
