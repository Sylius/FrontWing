import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5),
  title: z.string().min(1, "Title is required"),
  comment: z.string().min(1, "Comment is required"),
  email: z.string().email("Invalid email address"),
});
export type ReviewValues = z.infer<typeof reviewSchema>;
