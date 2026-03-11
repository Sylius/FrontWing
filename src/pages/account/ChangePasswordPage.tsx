import React, { useRef } from "react";
import Default from "../../layouts/Default.tsx";
import AccountLayout from "../../layouts/Account.tsx";
import { useCustomer } from "../../context/CustomerContext.tsx";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/layout/Loader.tsx";
import { useFlashMessages } from "../../context/FlashMessagesContext.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "@tanstack/react-form";
import { changePasswordSchema, ChangePasswordPayload } from "@/schemas/account";
import { passwordComplexity } from "@/schemas/auth";
import { applyServerErrors, submitForm } from "@/lib/utils";
import { FieldError } from "@/components/ui/field-error";
import { PasswordStrength } from "@/components/ui/password-strength";
import { z } from "zod";

const labelClass = "block text-sm font-medium mb-1";

const ChangePasswordPage: React.FC = () => {
  const { customer } = useCustomer();
  const navigate = useNavigate();
  const { addMessage } = useFlashMessages();
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmation: "",
    },
    validators: {
      onSubmit: changePasswordSchema,
    },
    onSubmit: async ({ value }) => {
      const payload: ChangePasswordPayload = {
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
      };

      try {
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}${customer && customer["@id"]}/password`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const data = await response.json();
          const formattedErrors: Record<string, string> = {};
          data.violations?.forEach((error: { propertyPath: string; message: string }) => {
            formattedErrors[error.propertyPath] = error.message;
          });
          const mappedErrors: Partial<Record<string, string>> = {};
          if (formattedErrors.currentPassword)
            mappedErrors.currentPassword = formattedErrors.currentPassword;
          if (formattedErrors.newPassword) mappedErrors.newPassword = formattedErrors.newPassword;
          if (formattedErrors.confirmNewPassword)
            mappedErrors.confirmation = formattedErrors.confirmNewPassword;
          applyServerErrors(form, mappedErrors);
          throw new Error("Failed to change password");
        }

        navigate("/account/dashboard");
        addMessage("success", "Password changed successfully");
      } catch {
        // Server error already handled via applyServerErrors above
      }
    },
  });

  return (
    <Default>
      <AccountLayout>
        <div className="w-full md:w-3/4">
          <div className="mb-4">
            <h1>Change password</h1>
            Set a new password for your account
          </div>

          <div className="relative mb-4">
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Loader loading={isSubmitting}>
                  <form
                    ref={formRef}
                    method="post"
                    noValidate
                    onSubmit={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void submitForm(form, formRef.current);
                    }}
                  >
                    <div className="mb-4">
                      <div className="mb-3">
                        <label className={labelClass}>Current password</label>
                        <form.Field
                          name="currentPassword"
                          validators={{
                            onSubmit: z.string().min(1, "Current password is required"),
                            onBlur: z.string().min(1, "Current password is required"),
                          }}
                        >
                          {(field) => (
                            <>
                              <Input
                                type="password"
                                required={true}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                                aria-describedby="currentPassword-error"
                                aria-invalid={
                                  (field.state.meta.errors?.length ?? 0) > 0 || undefined
                                }
                              />
                              <FieldError
                                id="currentPassword-error"
                                errors={field.state.meta.errors}
                                isTouched={field.state.meta.isTouched}
                                isSubmitted={form.state.isSubmitted}
                              />
                            </>
                          )}
                        </form.Field>
                      </div>

                      <div className="mb-3">
                        <label className={labelClass}>New password</label>
                        <form.Field
                          name="newPassword"
                          validators={{
                            onSubmit: passwordComplexity,
                            onBlur: passwordComplexity,
                            onChangeListenTo: ["confirmation"],
                            onBlurListenTo: ["confirmation"],
                          }}
                        >
                          {(field) => (
                            <>
                              <Input
                                type="password"
                                required={true}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                                aria-describedby="newPassword-error"
                                aria-invalid={
                                  (field.state.meta.errors?.length ?? 0) > 0 || undefined
                                }
                              />
                              <PasswordStrength value={field.state.value} />
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

                      <div className="mb-3">
                        <label className={labelClass}>Confirmation</label>
                        <form.Field
                          name="confirmation"
                          validators={{
                            onBlur: ({ value, fieldApi }) => {
                              const newPassword = fieldApi.form.getFieldValue("newPassword");
                              if (value !== newPassword) return "Passwords do not match";
                              return undefined;
                            },
                            onSubmit: ({ value, fieldApi }) => {
                              const newPassword = fieldApi.form.getFieldValue("newPassword");
                              if (value !== newPassword) return "Passwords do not match";
                              if (!value) return "Please confirm your password";
                              return undefined;
                            },
                            onChangeListenTo: ["newPassword"],
                            onBlurListenTo: ["newPassword"],
                          }}
                        >
                          {(field) => (
                            <>
                              <Input
                                type="password"
                                required={true}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                                aria-describedby="confirmation-error"
                                aria-invalid={
                                  (field.state.meta.errors?.length ?? 0) > 0 || undefined
                                }
                              />
                              <FieldError
                                id="confirmation-error"
                                errors={field.state.meta.errors}
                                isTouched={field.state.meta.isTouched}
                                isSubmitted={form.state.isSubmitted}
                              />
                            </>
                          )}
                        </form.Field>
                      </div>
                    </div>

                    <Button type="submit" id="save-changes">
                      Save changes
                    </Button>
                  </form>
                </Loader>
              )}
            </form.Subscribe>
          </div>
        </div>
      </AccountLayout>
    </Default>
  );
};

export default ChangePasswordPage;
