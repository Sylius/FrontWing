import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPasswordSchema } from "@/schemas/auth";
import { FieldError } from "@/components/ui/field-error";
import { submitForm } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Default from "../layouts/Default";

const labelClass = "block text-sm font-medium mb-1";

const ForgotPasswordPage: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: { onSubmit: forgotPasswordSchema },
    onSubmit: async ({ value }) => {
      try {
        await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/reset-password-requests`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: value.email }),
          }
        );
      } catch {
        // Intentionally silent: always show same message to prevent account enumeration
      }
      toast.success("If this email exists, a reset link has been sent.");
      form.reset();
    },
  });

  return (
    <Default>
      <div className="container my-auto">
        <div className="mx-auto my-8 w-full max-w-md">
          <h1 className="mb-2 text-2xl font-bold">Forgot your password?</h1>
          <p className="text-muted-foreground mb-5 text-sm">
            Enter your email and we will send you a reset link.
          </p>
          <form
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault();
              void submitForm(form, formRef.current);
            }}
            noValidate
          >
            <div className="mb-5">
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <form.Field
                name="email"
                validators={{
                  onSubmit: forgotPasswordSchema.shape.email,
                  onBlur: forgotPasswordSchema.shape.email,
                }}
              >
                {(field) => (
                  <>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      required
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-describedby="email-error"
                      aria-invalid={(field.state.meta.errors?.length ?? 0) > 0 || undefined}
                    />
                    <FieldError
                      id="email-error"
                      errors={field.state.meta.errors}
                      isTouched={field.state.meta.isTouched}
                      isSubmitted={form.state.isSubmitted}
                    />
                  </>
                )}
              </form.Field>
            </div>

            <Button type="submit" className="mb-3 w-full" disabled={form.state.isSubmitting}>
              Send reset link
            </Button>

            <p className="text-muted-foreground text-center text-sm">
              <Link to="/login" className="text-primary hover:underline">
                Back to login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </Default>
  );
};

export default ForgotPasswordPage;
