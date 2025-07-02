import React, { useState, useEffect, useRef } from 'react';
import { Product } from '~/types/Product';
import ProductCard from '~/components/ProductCard';
import Slider from '~/components/ClientOnlySlider';
import { PrevArrow, NextArrow } from '~/components/Arrow';
import { Settings } from 'react-slick';
import Skeleton from 'react-loading-skeleton';

interface AssociationsSectionProps {
    associations: { title: string; products: Product[] }[];
    loading: boolean;
}

const AssociationsSection: React.FC<AssociationsSectionProps> = ({ associations, loading }) => {
    const [isInView, setIsInView] = useState(false);
    const sectionRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting) {
                setIsInView(true); // Set to true when the section is in view
            }
        }, { threshold: 0.5 });

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    if (loading || !isInView) {
        return (
            <div className="container mb-5 position-relative" ref={sectionRef}>
                <Skeleton width={200} height={24} className="mb-3" />
                <div className="d-flex">
                    {Array(4)
                        .fill(0)
                        .map((_, i) => (
                            <div key={i} className="px-2" style={{ flex: '1 0 auto' }}>
                                <Skeleton height={300} />
                            </div>
                        ))}
                </div>
            </div>
        );
    }

    const settings: Settings = {
        infinite: true,
        slidesToShow: 5,
        slidesToScroll: 1,
        arrows: true,
        prevArrow: <PrevArrow />,
        nextArrow: <NextArrow />,
        responsive: [
            { breakpoint: 1400, settings: { slidesToShow: 4 } },
            { breakpoint: 1200, settings: { slidesToShow: 3 } },
            { breakpoint: 768, settings: { slidesToShow: 2 } },
            { breakpoint: 576, settings: { slidesToShow: 1 } },
        ],
    };

    return (
        <div ref={sectionRef}>
            {associations.map(({ title, products }) => (
                <div key={title} className="container mb-5 position-relative">
                    <h2 className="h4 mb-3">{title}</h2>
                    <Slider {...settings}>
                        {products.map((p) => (
                            <div key={p.code} className="px-2">
                                <ProductCard product={p} />
                            </div>
                        ))}
                    </Slider>
                </div>
            ))}
        </div>
    );
};

export default AssociationsSection;
