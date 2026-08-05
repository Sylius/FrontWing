import React from "react";
import { useTranslation } from "react-i18next";
import { LocalizedLink } from "~/components/LocalizedLink";

interface StepsProps {
    activeStep?: "address" | "shipping" | "payment" | "complete";
}

const steps = [
    { key: "address", labelKey: "steps.address", path: "/checkout/address" },
    { key: "shipping", labelKey: "steps.shipping", path: "/checkout/select-shipping" },
    { key: "payment", labelKey: "steps.payment", path: "/checkout/select-payment" },
    { key: "complete", labelKey: "steps.complete", path: "/checkout/complete" },
] as const;

const Steps: React.FC<StepsProps> = ({ activeStep = "address" }) => {
    const { t } = useTranslation("checkout");
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
                        <LocalizedLink to={step.path}>{t(step.labelKey)}</LocalizedLink>
                    ) : (
                        <span>{t(step.labelKey)}</span>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Steps;
