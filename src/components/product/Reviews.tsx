import React from "react";
import { ProductReview } from "../../types/Product";
import { IconStar } from "@tabler/icons-react";

interface ReviewListProps {
  reviews: ProductReview[];
}

const Reviews: React.FC<ReviewListProps> = ({ reviews }) => {
  return (
    <div className="mb-5">
      {reviews.map((review) => (
        <div key={review.id} className="border-b py-4">
          <div className="mb-2 w-full items-center justify-between sm:flex">
            <div className="mb-1 text-base font-semibold">{review.title}</div>
            <div className="mb-3 flex gap-1 text-3xl text-yellow-400">
              {[...Array(5)].map((_, index) => (
                <IconStar
                  key={index}
                  stroke={2}
                  size={20}
                  fill={index < review.rating ? "currentColor" : "none"}
                />
              ))}
            </div>
          </div>
          <div className="mb-2">
            <div>{review.comment}</div>
          </div>
          <small className="text-muted-foreground">
            {review.author?.firstName ? `${review.author.firstName}, ` : ""}
            {new Date(review.createdAt).toLocaleDateString()}
          </small>
        </div>
      ))}
    </div>
  );
};

export default Reviews;
