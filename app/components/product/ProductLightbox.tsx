import React, { useEffect, useState, Suspense, lazy } from 'react';
import type { LightboxProps, PortalSettings } from 'yet-another-react-lightbox';

const Lightbox = lazy(() => import('yet-another-react-lightbox'));

type ProductLightboxProps = {
    open: boolean;
    onClose: () => void;
    slides: LightboxProps['slides'];
    index: number;
};

const ProductLightbox: React.FC<ProductLightboxProps> = ({ open, onClose, slides, index }) => {
    const [isClient, setIsClient] = useState(false);
    const [portalTarget, setPortalTarget] = useState<PortalSettings | undefined>(undefined);

    useEffect(() => {
        setIsClient(true);
        setPortalTarget({ container: document.body } as any);
    }, []);

    if (!isClient || !portalTarget) return null;

    return (
        <Suspense fallback={null}>
            <Lightbox
                open={open}
                close={onClose}
                slides={slides}
                index={index}
                portal={portalTarget}
            />
        </Suspense>
    );
};

export default ProductLightbox;
