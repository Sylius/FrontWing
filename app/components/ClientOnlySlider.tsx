// components/ClientOnlySlider.tsx
import React, { useEffect, useState } from 'react';

export default function ClientOnlySlider(props: any) {
    const [Slider, setSlider] = useState<React.ComponentType<any> | null>(null);

    useEffect(() => {
        import('react-slick').then((mod) => {
            setSlider(() => mod.default);
        });
    }, []);

    if (!Slider) return null;

    return <Slider {...props} />;
}
