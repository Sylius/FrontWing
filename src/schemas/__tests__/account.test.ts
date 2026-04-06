import { describe, it, expect } from "vitest";
import { profileSchema, changePasswordSchema } from "../account";

function birthdayFor(yearsAgo: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - yearsAgo);
  return d.toISOString().slice(0, 10);
}

const profileBase = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  gender: "female",
  phoneNumber: "",
  subscribedToNewsletter: false,
};

describe("profileSchema birthday", () => {
  it("rejects empty birthday with required message", () => {
    const result = profileSchema.safeParse({ ...profileBase, birthday: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "birthday");
      expect(issue?.message).toBe("Birthday is required");
    }
  });

  it("rejects a future date", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const result = profileSchema.safeParse({
      ...profileBase,
      birthday: future.toISOString().slice(0, 10),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "birthday");
      expect(issue?.message).toBe("Birthday cannot be in the future");
    }
  });

  it("rejects age under 18", () => {
    const result = profileSchema.safeParse({ ...profileBase, birthday: birthdayFor(17) });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "birthday");
      expect(issue?.message).toBe("You must be at least 18 years old");
    }
  });

  it("rejects age over 120", () => {
    const result = profileSchema.safeParse({ ...profileBase, birthday: birthdayFor(121) });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "birthday");
      expect(issue?.message).toBe("Please enter a realistic birth year");
    }
  });

  it("accepts a valid 25-year-old birthday", () => {
    const result = profileSchema.safeParse({ ...profileBase, birthday: birthdayFor(25) });
    expect(result.success).toBe(true);
  });
});

describe("changePasswordSchema", () => {
  const base = {
    currentPassword: "OldPass1!",
    newPassword: "NewPass1!",
    confirmation: "NewPass1!",
  };

  it("rejects mismatched confirmation", () => {
    const result = changePasswordSchema.safeParse({ ...base, confirmation: "WrongPass1!" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "confirmation");
      expect(issue?.message).toBe("Passwords do not match");
    }
  });

  it("accepts valid matching passwords", () => {
    const result = changePasswordSchema.safeParse(base);
    expect(result.success).toBe(true);
  });
});
