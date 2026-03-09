import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  birthday: z.string(),
  gender: z.string(),
  phoneNumber: z.string(),
  subscribedToNewsletter: z.boolean(),
});
export type ProfileValues = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
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
