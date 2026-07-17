import React from "react";
import { IconPercentage, IconPlus } from "@tabler/icons-react";

const CouponRow: React.FC = () => (
    <div className="d-flex align-items-center justify-content-between">
        <span className="d-flex align-items-center gap-2">
            <IconPercentage className="icon icon-sm" stroke={2} />
            Apply coupon code
        </span>

        <button
            type="button"
            className="btn btn-sm btn-transparent px-2"
            aria-label="Show coupon code form"
            aria-expanded={false}
            disabled
        >
            <IconPlus className="icon icon-sm" stroke={2} />
        </button>
    </div>
);

export default CouponRow;
