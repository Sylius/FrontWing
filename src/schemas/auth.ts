import { z } from "zod";

export const passwordComplexity = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one digit")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol");

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  remember_me: z.boolean(),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    gender: z.string(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: passwordComplexity,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    subscribedToNewsletter: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type RegisterValues = z.infer<typeof registerSchema>;
export type RegisterPayload = Omit<RegisterValues, "confirmPassword">;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: passwordComplexity,
    confirmNewPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordPayload = Pick<ResetPasswordValues, "newPassword">;
