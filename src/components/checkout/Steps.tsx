import React from "react";
import { Link } from "react-router-dom";

interface StepsProps {
    activeStep?: "address" | "shipping" | "payment" | "complete";
}

const steps = [
    { key: "address", label: "Address", path: "/checkout/address" },
    { key: "shipping", label: "Shipping", path: "/checkout/select-shipping" },
    { key: "payment", label: "Payment", path: "/checkout/select-payment" },
    { key: "complete", label: "Complete", path: "/checkout/complete" },
];

const Steps: React.FC<StepsProps> = ({ activeStep = "address" }) => {
    const activeIndex = steps.findIndex((step) => step.key === activeStep);

    return (
        <div className={`steps mb-5 ${activeStep === 'complete' ? 'steps-complete' : ''}`}>
            {steps.map((step, index) => (
                <div
                    key={step.key}
                    className={`steps-item ${
                        index === activeIndex
                            ? "steps-item-active"
                            : index < activeIndex
                                ? ""
                                : "steps-item-disabled"
                    }`}
                >
                    {index <= activeIndex ? (
                        <Link to={step.path}>{step.label}</Link>
                    ) : (
                        <span>{step.label}</span>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Steps;
