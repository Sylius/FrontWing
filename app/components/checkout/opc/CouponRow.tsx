import React, { useState } from "react";
import { IconPercentage, IconPlus, IconX } from "@tabler/icons-react";
import { useCheckout } from "~/context/CheckoutContext";

const CouponRow: React.FC = () => {
    const { state, setCoupon } = useCheckout();
    const [expanded, setExpanded] = useState(false);
    const [value, setValue] = useState("");

    const apply = () => {
        const code = value.trim();
        if (code === "") return;
        setCoupon(code);
        setExpanded(false);
    };

    const remove = () => {
        setCoupon(null);
        setValue("");
    };

    if (state.couponCode) {
        return (
            <div className="d-flex align-items-center justify-content-between">
                <span className="d-flex align-items-center gap-2">
                    <IconPercentage className="icon icon-sm" stroke={2} />
                    Coupon <strong>{state.couponCode}</strong> applied
                </span>

                <button
                    type="button"
                    className="btn btn-sm btn-transparent px-2"
                    aria-label="Remove coupon code"
                    onClick={remove}
                >
                    <IconX className="icon icon-sm" stroke={2} />
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="d-flex align-items-center justify-content-between">
                <span className="d-flex align-items-center gap-2">
                    <IconPercentage className="icon icon-sm" stroke={2} />
                    Apply coupon code
                </span>

                <button
                    type="button"
                    className="btn btn-sm btn-transparent px-2"
                    aria-label="Show coupon code form"
                    aria-expanded={expanded}
                    onClick={() => setExpanded((open) => !open)}
                >
                    <IconPlus className="icon icon-sm" stroke={2} />
                </button>
            </div>

            {expanded && (
                <div className="input-group mt-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Coupon code"
                        aria-label="Coupon code"
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                apply();
                            }
                        }}
                    />
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={apply}
                        disabled={value.trim() === ""}
                    >
                        Apply
                    </button>
                </div>
            )}
        </>
    );
};

export default CouponRow;
