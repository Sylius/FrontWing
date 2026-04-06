import { describe, it, expect } from "vitest";
import { reviewSchema } from "../review";

describe("reviewSchema", () => {
  const base = {
    rating: 5,
    title: "Great product",
    comment: "Really enjoyed it.",
    email: "reviewer@example.com",
  };

  it("rejects rating of 0", () => {
    const result = reviewSchema.safeParse({ ...base, rating: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "rating");
      expect(issue).toBeDefined();
    }
  });

  it("accepts rating of 1", () => {
    const result = reviewSchema.safeParse({ ...base, rating: 1 });
    expect(result.success).toBe(true);
  });

  it("accepts rating of 5", () => {
    const result = reviewSchema.safeParse({ ...base, rating: 5 });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = reviewSchema.safeParse({ ...base, title: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "title");
      expect(issue?.message).toBe("Title is required");
    }
  });

  it("rejects empty comment", () => {
    const result = reviewSchema.safeParse({ ...base, comment: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "comment");
      expect(issue?.message).toBe("Comment is required");
    }
  });

  it("rejects invalid email", () => {
    const result = reviewSchema.safeParse({ ...base, email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "email");
      expect(issue?.message).toBe("Invalid email address");
    }
  });

  it("accepts valid review data", () => {
    const result = reviewSchema.safeParse(base);
    expect(result.success).toBe(true);
  });
});
