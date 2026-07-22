import React from "react";
import { Link } from "react-router";

interface BreadcrumbsProps {
    paths?: { label: string; url: string }[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ paths = [] }) => {
    if (paths.length === 0) return null;

    return (
        <ol className="breadcrumb" aria-label="breadcrumbs">
            {paths.map((path, index) => (
                <li
                    key={index}
                    className={`breadcrumb-item fw-normal ${index === paths.length - 1 ? "active" : ""}`}
                >
                    {path.url && index < paths.length - 1 ? (
                        <Link to={path.url} className="text-body-tertiary text-break">
                            {path.label}
                        </Link>
                    ) : (
                        <span className="text-body-tertiary text-break">{path.label}</span>
                    )}
                </li>
            ))}
        </ol>
    );
};

export default Breadcrumbs;
