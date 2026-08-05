import React from "react";
import { useTranslation } from "react-i18next";
import { LocalizedLink } from "~/components/LocalizedLink";

interface BreadcrumbsProps {
    paths?: { label: string; url: string }[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ paths = [] }) => {
    const { t } = useTranslation();

    if (paths.length === 0) return null;

    return (
        <ol className="breadcrumb" aria-label={t("aria.breadcrumbs")}>
            {paths.map((path, index) => (
                <li
                    key={index}
                    className={`breadcrumb-item fw-normal ${index === paths.length - 1 ? "active" : ""}`}
                >
                    {path.url && index < paths.length - 1 ? (
                        <LocalizedLink to={path.url} className="text-body-tertiary text-break">
                            {path.label}
                        </LocalizedLink>
                    ) : (
                        <span className="text-body-tertiary text-break">{path.label}</span>
                    )}
                </li>
            ))}
        </ol>
    );
};

export default Breadcrumbs;
