import React from "react";
import { IconPackage } from "@tabler/icons-react";

interface Props {
    src?: string;
    alt: string;
}

const MethodLogo: React.FC<Props> = ({ src, alt }) => (
    <div
        className="d-flex align-items-center justify-content-center flex-shrink-0 bg-white rounded"
        style={{ width: "60px", height: "60px" }}
    >
        {src ? (
            <img src={src} alt={alt} className="img-fluid p-2" />
        ) : (
            <IconPackage className="icon icon-md text-body-tertiary" stroke={2} />
        )}
    </div>
);

export default MethodLogo;
