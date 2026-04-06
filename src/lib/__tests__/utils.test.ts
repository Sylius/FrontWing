import { describe, it, expect, vi } from "vitest";
import { formError, applyServerErrors, clearServerErrors } from "../utils";

describe("formError", () => {
  it("returns the string when given a string", () => {
    expect(formError("some error")).toBe("some error");
  });

  it("returns message when given an object with a message property", () => {
    expect(formError({ message: "err" })).toBe("err");
  });

  it("returns empty string for undefined", () => {
    expect(formError(undefined)).toBe("");
  });

  it("returns empty string for a number", () => {
    expect(formError(42)).toBe("");
  });
});

function makeMockForm(fieldNames: string[]) {
  const fieldMeta: Record<string, { errorMap: Record<string, unknown>; isTouched: boolean }> = {};
  for (const name of fieldNames) {
    fieldMeta[name] = { errorMap: {}, isTouched: false };
  }

  const setFieldMeta = vi.fn(
    (field: string, updater: (meta: (typeof fieldMeta)[string]) => (typeof fieldMeta)[string]) => {
      fieldMeta[field] = updater(fieldMeta[field]);
    }
  );

  return { state: { fieldMeta }, setFieldMeta };
}

describe("applyServerErrors", () => {
  it("sets errorMap.onServer and isTouched=true on each specified field", () => {
    const form = makeMockForm(["email", "password"]);
    applyServerErrors(form, { email: "Email taken", password: "Too weak" });

    expect(form.setFieldMeta).toHaveBeenCalledTimes(2);
    expect(form.state.fieldMeta.email.errorMap.onServer).toBe("Email taken");
    expect(form.state.fieldMeta.email.isTouched).toBe(true);
    expect(form.state.fieldMeta.password.errorMap.onServer).toBe("Too weak");
    expect(form.state.fieldMeta.password.isTouched).toBe(true);
  });
});

describe("clearServerErrors", () => {
  it("sets errorMap.onServer to undefined on all fields", () => {
    const form = makeMockForm(["email", "password"]);
    form.state.fieldMeta.email.errorMap.onServer = "Email taken";
    form.state.fieldMeta.password.errorMap.onServer = "Too weak";

    clearServerErrors(form);

    expect(form.setFieldMeta).toHaveBeenCalledTimes(2);
    expect(form.state.fieldMeta.email.errorMap.onServer).toBeUndefined();
    expect(form.state.fieldMeta.password.errorMap.onServer).toBeUndefined();
  });
});
