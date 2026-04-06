import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PasswordStrength } from "../password-strength";

describe("PasswordStrength", () => {
  it("renders null when value is empty", () => {
    const { container } = render(<PasswordStrength value="" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders 4 segment bars for any non-empty value", () => {
    const { container } = render(<PasswordStrength value="abc" />);
    const segments = container.querySelectorAll(".h-1.flex-1.rounded-full");
    expect(segments).toHaveLength(4);
  });

  it("shows no colored segments for weak value 'abc' (score 0, all segments muted)", () => {
    const { container } = render(<PasswordStrength value="abc" />);
    const segments = container.querySelectorAll(".h-1.flex-1.rounded-full");
    segments.forEach((seg) => {
      expect(seg.className).toContain("bg-muted");
      expect(seg.className).not.toContain("bg-green-500");
      expect(seg.className).not.toContain("bg-yellow-400");
      expect(seg.className).not.toContain("bg-orange-400");
      expect(seg.className).not.toContain("bg-destructive");
    });
  });

  it("shows all 4 colored segments for strong password 'Abcde1!x' (score 4)", () => {
    const { container } = render(<PasswordStrength value="Abcde1!x" />);
    const segments = container.querySelectorAll(".h-1.flex-1.rounded-full");
    expect(segments).toHaveLength(4);
    segments.forEach((seg) => {
      expect(seg.className).toContain("bg-green-500");
    });
  });

  it("displays 'Strong' label for score 4", () => {
    render(<PasswordStrength value="Abcde1!x" />);
    expect(screen.getByText("Strong")).toBeInTheDocument();
  });

  it("displays 'Too weak' label for score 1", () => {
    // Only length >= 8 passes: "abcdefgh" — length yes, no uppercase, no digit, no symbol → score 1
    render(<PasswordStrength value="abcdefgh" />);
    expect(screen.getByText("Too weak")).toBeInTheDocument();
  });

  it("displays 'Weak' label for score 2", () => {
    // length + uppercase, no digit, no symbol → score 2: "Abcdefgh"
    render(<PasswordStrength value="Abcdefgh" />);
    expect(screen.getByText("Weak")).toBeInTheDocument();
  });

  it("displays 'Good' label for score 3", () => {
    // length + uppercase + digit, no symbol → score 3: "Abcde123"
    render(<PasswordStrength value="Abcde123" />);
    expect(screen.getByText("Good")).toBeInTheDocument();
  });

  it("shows no label text for score 0", () => {
    // "abc": length<8, no uppercase, no digit, no symbol → score 0
    const { container } = render(<PasswordStrength value="abc" />);
    const label = container.querySelector("p");
    expect(label).toBeNull();
  });
});
