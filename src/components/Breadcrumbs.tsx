import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";
import { Link } from "react-router-dom";

interface BreadcrumbsProps {
  paths?: { label: string; url: string }[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ paths = [] }) => {
  if (paths.length === 0) return null;

  return (
    <Breadcrumb className="mb-5">
      <BreadcrumbList>
        {paths.map((path, index) => {
          const isLast = index === paths.length - 1;
          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{path.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link to={path.url} />}>{path.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
