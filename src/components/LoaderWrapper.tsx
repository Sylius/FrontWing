import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

interface LoaderWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeletonCount?: number;
  skeletonHeight?: number;
  fullWidth?: boolean;
}

const LoaderWrapper: React.FC<LoaderWrapperProps> = ({
  isLoading,
  children,
  skeletonCount = 5,
  skeletonHeight = 24,
  fullWidth = true,
}) => {
  if (isLoading) {
    return (
      <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f5f5f5">
        <div className="d-flex flex-column gap-3">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <Skeleton key={i} height={skeletonHeight} width={fullWidth ? "100%" : undefined} />
          ))}
        </div>
      </SkeletonTheme>
    );
  }

  return <>{children}</>;
};

export default LoaderWrapper;
