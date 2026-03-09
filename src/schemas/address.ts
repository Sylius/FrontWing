import { z } from "zod";

export const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  company: z.string(),
  street: z.string().min(1, "Street address is required"),
  countryCode: z.string().min(1, "Country is required"),
  provinceName: z.string(),
  city: z.string().min(1, "City is required"),
  postcode: z.string().min(1, "Postcode is required"),
  phoneNumber: z.string(),
});
export type AddressValues = z.infer<typeof addressSchema>;

export const checkoutAddressSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  billingAddress: addressSchema,
  useDifferentShipping: z.boolean().optional(),
  shippingAddress: addressSchema.optional(),
});
export type CheckoutAddressValues = z.infer<typeof checkoutAddressSchema>;
