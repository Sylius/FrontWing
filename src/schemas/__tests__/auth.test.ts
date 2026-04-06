import { describe, it, expect } from "vitest";
import { loginSchema, passwordComplexity, registerSchema, resetPasswordSchema } from "../auth";

describe("loginSchema", () => {
  it("rejects empty email", () => {
    const result = loginSchema.safeParse({ email: "", password: "secret", remember_me: false });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "secret",
      remember_me: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailIssue = result.error.issues.find((i) => i.path[0] === "email");
      expect(emailIssue?.message).toBe("Invalid email address");
    }
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
      remember_me: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const passIssue = result.error.issues.find((i) => i.path[0] === "password");
      expect(passIssue).toBeDefined();
    }
  });

  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "pass123",
      remember_me: true,
    });
    expect(result.success).toBe(true);
  });
});

describe("passwordComplexity", () => {
  it("rejects password shorter than 8 characters", () => {
    const result = passwordComplexity.safeParse("Ab1!");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Password must be at least 8 characters");
    }
  });

  it("rejects password without uppercase letter", () => {
    const result = passwordComplexity.safeParse("abcde1!x");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Password must contain at least one uppercase letter"
      );
    }
  });

  it("rejects password without digit", () => {
    const result = passwordComplexity.safeParse("Abcdefg!");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Password must contain at least one digit");
    }
  });

  it("rejects password without symbol", () => {
    const result = passwordComplexity.safeParse("Abcde123");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Password must contain at least one symbol");
    }
  });

  it("accepts a strong password meeting all criteria", () => {
    const result = passwordComplexity.safeParse("Abcde1!x");
    expect(result.success).toBe(true);
  });
});

describe("registerSchema", () => {
  const base = {
    gender: "male",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "Abcde1!x",
    confirmPassword: "Abcde1!x",
    subscribedToNewsletter: false,
  };

  it("rejects mismatched confirmPassword", () => {
    const result = registerSchema.safeParse({ ...base, confirmPassword: "Different1!" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "confirmPassword");
      expect(issue?.message).toBe("Passwords do not match");
    }
  });

  it("accepts matching passwords", () => {
    const result = registerSchema.safeParse(base);
    expect(result.success).toBe(true);
  });
});

describe("resetPasswordSchema", () => {
  it("rejects a weak newPassword", () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: "weak",
      confirmNewPassword: "weak",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "newPassword");
      expect(issue).toBeDefined();
    }
  });

  it("rejects mismatched confirmNewPassword", () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: "Abcde1!x",
      confirmNewPassword: "Different1!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "confirmNewPassword");
      expect(issue?.message).toBe("Passwords do not match");
    }
  });

  it("accepts valid strong matching passwords", () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: "Abcde1!x",
      confirmNewPassword: "Abcde1!x",
    });
    expect(result.success).toBe(true);
  });
});
