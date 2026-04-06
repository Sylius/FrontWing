import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPasswordSchema, passwordComplexity } from "@/schemas/auth";
import { FieldError } from "@/components/ui/field-error";
import { submitForm } from "@/lib/utils";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import React, { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Default from "../layouts/Default";

const labelClass = "block text-sm font-medium mb-1";

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm({
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
    validators: { onSubmit: resetPasswordSchema },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/reset-password-requests/${token}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/merge-patch+json" },
            body: JSON.stringify({
              newPassword: value.newPassword,
              confirmNewPassword: value.confirmNewPassword,
            }),
          }
        );

        if (!response.ok) {
          const errData: { "hydra:description"?: string; message?: string } = await response.json();
          throw new Error(
            errData["hydra:description"] ??
              errData.message ??
              "This reset link is invalid or has expired."
          );
        }

        toast.success("Password reset successfully.");
        navigate("/login");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "This reset link is invalid or has expired.");
      }
    },
  });

  return (
    <Default>
      <div className="container my-auto">
        <div className="mx-auto my-8 w-full max-w-md">
          <h1 className="mb-5 text-2xl font-bold">Reset your password</h1>
          <form
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault();
              void submitForm(form, formRef.current);
            }}
            noValidate
          >
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mb-3">
              <label htmlFor="newPassword" className={labelClass}>
                New password
              </label>
              <form.Field
                name="newPassword"
                validators={{ onSubmit: passwordComplexity, onBlur: passwordComplexity }}
              >
                {(field) => (
                  <>
                    <Input
                      id="newPassword"
                      type="password"
                      name="newPassword"
                      required
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-describedby="newPassword-error"
                      aria-invalid={(field.state.meta.errors?.length ?? 0) > 0 || undefined}
                    />
                    <FieldError
                      id="newPassword-error"
                      errors={field.state.meta.errors}
                      isTouched={field.state.meta.isTouched}
                      isSubmitted={form.state.isSubmitted}
                    />
                  </>
                )}
              </form.Field>
            </div>

            <div className="mb-5">
              <label htmlFor="confirmNewPassword" className={labelClass}>
                Confirm new password
              </label>
              <form.Field
                name="confirmNewPassword"
                validators={{
                  onSubmit: z.string().min(1, "Please confirm your password"),
                  onBlur: z.string().min(1, "Please confirm your password"),
                }}
              >
                {(field) => (
                  <>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      name="confirmNewPassword"
                      required
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-describedby="confirmNewPassword-error"
                      aria-invalid={(field.state.meta.errors?.length ?? 0) > 0 || undefined}
                    />
                    <FieldError
                      id="confirmNewPassword-error"
                      errors={field.state.meta.errors}
                      isTouched={field.state.meta.isTouched}
                      isSubmitted={form.state.isSubmitted}
                    />
                  </>
                )}
              </form.Field>
            </div>

            <Button type="submit" className="w-full" disabled={form.state.isSubmitting}>
              Reset password
            </Button>
          </form>
        </div>
      </div>
    </Default>
  );
};

export default ResetPasswordPage;
