import React, { useRef, useState } from "react";
import Default from "../../layouts/Default.tsx";
import AccountLayout from "../../layouts/Account.tsx";
import { useCustomer } from "../../context/CustomerContext.tsx";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/layout/Loader.tsx";
import { useFlashMessages } from "../../context/FlashMessagesContext.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "@tanstack/react-form";
import { ChangePasswordPayload } from "@/schemas/account";
import { passwordComplexity } from "@/schemas/auth";
import { applyServerErrors, submitForm } from "@/lib/utils";
import { FieldError } from "@/components/ui/field-error";
import { PasswordStrength } from "@/components/ui/password-strength";
import { z } from "zod";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

const labelClass = "block text-sm font-medium mb-1";

const ChangePasswordPage: React.FC = () => {
  const { customer } = useCustomer();
  const navigate = useNavigate();
  const { addMessage } = useFlashMessages();
  const formRef = useRef<HTMLFormElement>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmation: "",
    },
    onSubmit: async ({ value }) => {
      const payload: ChangePasswordPayload = {
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
        confirmNewPassword: value.confirmation,
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
                              <div className="relative">
                                <Input
                                  type={showCurrentPassword ? "text" : "password"}
                                  required={true}
                                  className="pr-10"
                                  value={field.state.value}
                                  onChange={(e) => field.handleChange(e.target.value)}
                                  onBlur={field.handleBlur}
                                  aria-describedby="currentPassword-error"
                                  aria-invalid={
                                    (field.state.meta.errors?.length ?? 0) > 0 || undefined
                                  }
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowCurrentPassword((v) => !v)}
                                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 focus:outline-none"
                                  aria-label={
                                    showCurrentPassword ? "Hide password" : "Show password"
                                  }
                                >
                                  {showCurrentPassword ? (
                                    <IconEyeOff size={18} />
                                  ) : (
                                    <IconEye size={18} />
                                  )}
                                </button>
                              </div>
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
                              <div className="relative">
                                <Input
                                  type={showNewPassword ? "text" : "password"}
                                  required={true}
                                  className="pr-10"
                                  value={field.state.value}
                                  onChange={(e) => field.handleChange(e.target.value)}
                                  onBlur={field.handleBlur}
                                  aria-describedby="newPassword-error"
                                  aria-invalid={
                                    (field.state.meta.errors?.length ?? 0) > 0 || undefined
                                  }
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowNewPassword((v) => !v)}
                                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 focus:outline-none"
                                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                                >
                                  {showNewPassword ? (
                                    <IconEyeOff size={18} />
                                  ) : (
                                    <IconEye size={18} />
                                  )}
                                </button>
                              </div>
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
                              <div className="relative">
                                <Input
                                  type={showConfirmation ? "text" : "password"}
                                  required={true}
                                  className="pr-10"
                                  value={field.state.value}
                                  onChange={(e) => field.handleChange(e.target.value)}
                                  onBlur={field.handleBlur}
                                  aria-describedby="confirmation-error"
                                  aria-invalid={
                                    (field.state.meta.errors?.length ?? 0) > 0 || undefined
                                  }
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmation((v) => !v)}
                                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 focus:outline-none"
                                  aria-label={showConfirmation ? "Hide password" : "Show password"}
                                >
                                  {showConfirmation ? (
                                    <IconEyeOff size={18} />
                                  ) : (
                                    <IconEye size={18} />
                                  )}
                                </button>
                              </div>
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
