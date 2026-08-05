import { useCallback } from "react";
import { useNavigate, type NavigateOptions } from "react-router";
import { useLocalizedHref } from "~/hooks/useLocalizedHref";

export const useLocalizedNavigate = () => {
    const navigate = useNavigate();
    const localize = useLocalizedHref();

    return useCallback(
        (to: string, options?: NavigateOptions) => navigate(localize(to), options),
        [navigate, localize],
    );
};
