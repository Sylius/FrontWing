import { useMutation } from "@tanstack/react-query";
import { useLocalizedNavigate } from "~/hooks/useLocalizedNavigate";
import { checkoutApi } from "~/modules/checkout-opc/api/checkoutApi";
import { CheckoutCompleteError, type CheckoutViolation } from "~/modules/checkout-opc/api/checkoutApi";
import { clearPersistedCheckoutState } from "~/modules/checkout-opc/utils/checkoutStatePersistence";
import type { CheckoutState } from "~/modules/checkout-opc/types";

export interface UseCheckoutSubmitResult {
    submit: (state: CheckoutState, hash: string) => void;
    isSubmitting: boolean;
    errorMessage: string | null;
    violations: CheckoutViolation[];
}

export const useCheckoutSubmit = (token: string): UseCheckoutSubmitResult => {
    const navigate = useLocalizedNavigate();

    const mutation = useMutation({
        mutationFn: ({ state, hash }: { state: CheckoutState; hash: string }) =>
            checkoutApi.completeCheckout(token, state, hash),
        onSuccess: () => {
            clearPersistedCheckoutState();
            navigate("/order/thank-you", { state: { tokenValue: token } });
        },
    });

    const error = mutation.error;
    const violations = error instanceof CheckoutCompleteError ? error.violations : [];

    return {
        submit: (state, hash) => mutation.mutate({ state, hash }),
        isSubmitting: mutation.isPending,
        errorMessage: error ? error.message : null,
        violations,
    };
};
