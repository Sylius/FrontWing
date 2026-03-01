import { IconStar } from '@tabler/icons-react';
import React from 'react';
import { ProductReview } from '../../types/Product';

interface ReviewSummaryProps {
    reviews: ProductReview[];
    productCode: string;
    allReviewCount: number;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({ reviews, productCode, allReviewCount }) => {
    const averageRating =
        reviews.length > 0
            ? Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length)
            : 0;

    const renderStars = (rating: number) => (
        <div className="text-2xl text-yellow-400 flex gap-1">
            {[...Array(5)].map((_, index) => (
                <IconStar
                    key={index}
                    stroke={2}
                    size={20}
                    fill={index < rating ? 'currentColor' : 'none'}
                />
            ))}
        </div>
    );

    return allReviewCount > 0 ? (
        <div className="flex flex-wrap mb-2">
            <div className="md:w-auto md:mr-4">{renderStars(averageRating)}</div>
            <div className="md:w-auto md:mr-4">
                {allReviewCount} review{allReviewCount !== 1 && 's'}
            </div>
            <a href={`/product/${productCode}/review/new`} className="md:w-auto hover:text-primary">
                Add your review
            </a>
        </div>
    ) : (
        <div className="flex flex-wrap mb-2">
            <div className="md:w-auto md:mr-4">{renderStars(0)}</div>
            <div className="md:w-auto md:mr-4">0 reviews</div>
            <a href={`/product/${productCode}/review/new`} className="md:w-auto hover:text-primary">
                Add your review
            </a>
        </div>
    );
};

export default ReviewSummary;
