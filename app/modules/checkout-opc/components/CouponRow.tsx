import React, { useState } from "react";
import { IconPercentage, IconChevronDown, IconX } from "@tabler/icons-react";
import { useCheckout } from "~/modules/checkout-opc/context/CheckoutContext";

const COUPON_COLLAPSE_ID = "opc-coupon-collapse";

const CouponRow: React.FC = () => {
    const { state, setCoupon } = useCheckout();
    const [value, setValue] = useState("");

    const apply = () => {
        const code = value.trim();
        if (code === "") return;
        setCoupon(code);
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
            <button
                type="button"
                className="coupon-toggle btn btn-transparent border-0 shadow-none px-0 py-2 w-100 d-flex align-items-center justify-content-between collapsed"
                data-bs-toggle="collapse"
                data-bs-target={`#${COUPON_COLLAPSE_ID}`}
                aria-expanded="false"
                aria-controls={COUPON_COLLAPSE_ID}
            >
                <span className="d-flex align-items-center gap-2">
                    <IconPercentage className="icon icon-sm" stroke={2} />
                    Apply coupon code
                </span>

                <IconChevronDown className="icon icon-sm coupon-chevron" stroke={2} />
            </button>

            <div className="collapse" id={COUPON_COLLAPSE_ID}>
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
            </div>
        </>
    );
};

export default CouponRow;
