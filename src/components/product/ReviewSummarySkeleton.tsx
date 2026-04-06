import React from "react";
import Skeleton from "react-loading-skeleton";

const ReviewSummarySkeleton: React.FC = () => {
  return (
    <div className="mb-3">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex gap-1 text-2xl">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} width={18} height={18} circle />
          ))}
        </div>

        <Skeleton width={60} height={16} />

        <Skeleton width={100} height={16} />
      </div>
    </div>
  );
};

export default ReviewSummarySkeleton;
