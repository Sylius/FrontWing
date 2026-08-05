import { forwardRef } from "react";
import { Link, type LinkProps } from "react-router";
import { useLocalizedHref } from "~/hooks/useLocalizedHref";

export type LocalizedLinkProps = Omit<LinkProps, "to"> & { to: string };

export const LocalizedLink = forwardRef<HTMLAnchorElement, LocalizedLinkProps>(
    ({ to, ...props }, ref) => {
        const localize = useLocalizedHref();
        return <Link ref={ref} to={localize(to)} {...props} />;
    },
);

LocalizedLink.displayName = "LocalizedLink";
