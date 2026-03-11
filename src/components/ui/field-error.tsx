import type { ValidationError } from "@tanstack/react-form";
import { formError } from "@/lib/utils";

interface FieldErrorProps {
  id: string;
  errors: ValidationError[];
  isTouched: boolean;
  isSubmitted?: boolean;
}

export function FieldError({ id, errors, isTouched, isSubmitted = false }: FieldErrorProps) {
  if (!(isTouched || isSubmitted) || errors.length === 0) {
    return null;
  }
  return (
    <span id={id} className="text-destructive text-sm">
      {formError(errors[0])}
    </span>
  );
}
