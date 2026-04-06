import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// TanStack Form v1 with StandardSchemaV1 (Zod) stores issue objects { message: string }
// in field.state.meta.errors, not plain strings. This helper extracts the message.
export function formError(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: string }).message);
  }
  return "";
}

type FormWithSetFieldMeta = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFieldMeta: (field: any, updater: (meta: any) => any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: { fieldMeta: Record<string, any> };
};

export function clearServerErrors(form: FormWithSetFieldMeta): void {
  for (const fieldName of Object.keys(form.state.fieldMeta)) {
    form.setFieldMeta(fieldName, (meta) => ({
      ...meta,
      errorMap: { ...meta.errorMap, onServer: undefined },
    }));
  }
}

export function applyServerErrors(
  form: FormWithSetFieldMeta,
  errors: Partial<Record<string, string>>
): void {
  for (const [field, message] of Object.entries(errors)) {
    form.setFieldMeta(field, (meta) => ({
      ...meta,
      errorMap: { ...meta.errorMap, onServer: message },
      isTouched: true,
    }));
  }
}

export async function submitForm(
  form: FormWithSetFieldMeta & { handleSubmit: () => Promise<void> },
  formEl?: HTMLFormElement | null
): Promise<void> {
  clearServerErrors(form);
  await form.handleSubmit();
  if (formEl) {
    const firstInvalid = formEl.querySelector<HTMLElement>('[aria-invalid="true"]');
    firstInvalid?.focus();
  }
}
