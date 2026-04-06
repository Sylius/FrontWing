import { z } from "zod";
import { passwordComplexity } from "./auth";

export const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  birthday: z
    .string()
    .or(z.literal(""))
    .superRefine((val, ctx) => {
      if (val === "") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Birthday is required" });
        return;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(val) || isNaN(new Date(val).getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Birthday must be a valid date (YYYY-MM-DD)",
        });
        return;
      }
      const birth = new Date(val);
      const today = new Date();
      if (birth > today) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Birthday cannot be in the future" });
        return;
      }
      const age =
        today.getFullYear() -
        birth.getFullYear() -
        (today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
          ? 1
          : 0);
      if (age < 18) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "You must be at least 18 years old" });
        return;
      }
      if (age > 120) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a realistic birth year",
        });
      }
    })
    .transform((val) => (val === "" ? undefined : val)),
  gender: z.string(),
  phoneNumber: z.string(),
  subscribedToNewsletter: z.boolean(),
});
export type ProfileValues = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordComplexity,
    confirmation: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmation, {
    message: "Passwords do not match",
    path: ["confirmation"],
  });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};
