import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FieldError } from "../field-error";

describe("FieldError", () => {
  it("renders null when isTouched=false and isSubmitted=false even with errors", () => {
    const { container } = render(
      <FieldError
        id="email-error"
        errors={["Email is required"]}
        isTouched={false}
        isSubmitted={false}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders null when errors array is empty even when isTouched=true", () => {
    const { container } = render(<FieldError id="email-error" errors={[]} isTouched={true} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the error message when isTouched=true and errors are present", () => {
    render(<FieldError id="email-error" errors={["Email is required"]} isTouched={true} />);
    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("renders the error message when isSubmitted=true and errors are present (isTouched=false)", () => {
    render(
      <FieldError
        id="email-error"
        errors={["Email is required"]}
        isTouched={false}
        isSubmitted={true}
      />
    );
    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("renders only the first error when multiple errors are passed", () => {
    render(
      <FieldError id="email-error" errors={["First error", "Second error"]} isTouched={true} />
    );
    expect(screen.getByText("First error")).toBeInTheDocument();
    expect(screen.queryByText("Second error")).not.toBeInTheDocument();
  });
});
