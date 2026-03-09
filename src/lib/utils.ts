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
