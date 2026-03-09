import React from "react";
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
import { formError } from "@/lib/utils";

const labelClass = "block text-sm font-medium mb-1";

const ChangePasswordPage: React.FC = () => {
  const { customer } = useCustomer();
  const navigate = useNavigate();
  const { addMessage } = useFlashMessages();

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
          // Re-surface API errors via form field errors
          if (formattedErrors.currentPassword) {
            form.setFieldMeta("currentPassword", (prev) => ({
              ...prev,
              errors: [formattedErrors.currentPassword],
              errorMap: { onSubmit: formattedErrors.currentPassword },
            }));
          }
          if (formattedErrors.newPassword) {
            form.setFieldMeta("newPassword", (prev) => ({
              ...prev,
              errors: [formattedErrors.newPassword],
              errorMap: { onSubmit: formattedErrors.newPassword },
            }));
          }
          if (formattedErrors.confirmNewPassword) {
            form.setFieldMeta("confirmation", (prev) => ({
              ...prev,
              errors: [formattedErrors.confirmNewPassword],
              errorMap: { onSubmit: formattedErrors.confirmNewPassword },
            }));
          }
          throw new Error("Failed to change password");
        }

        navigate("/account/dashboard");
        addMessage("success", "Password changed successfully");
      } catch (err) {
        console.log(err);
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
                    method="post"
                    noValidate
                    onSubmit={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      form.handleSubmit();
                    }}
                  >
                    <div className="mb-4">
                      <div className="mb-3">
                        <label className={labelClass}>Current password</label>
                        <form.Field name="currentPassword">
                          {(field) => (
                            <>
                              <Input
                                type="password"
                                required={true}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                                aria-invalid={
                                  (field.state.meta.errors?.length ?? 0) > 0 || undefined
                                }
                              />
                              {(field.state.meta.errors?.length ?? 0) > 0 && (
                                <div className="text-destructive mt-1 text-sm">
                                  {formError(field.state.meta.errors?.[0])}
                                </div>
                              )}
                            </>
                          )}
                        </form.Field>
                      </div>

                      <div className="mb-3">
                        <label className={labelClass}>New password</label>
                        <form.Field name="newPassword">
                          {(field) => (
                            <>
                              <Input
                                type="password"
                                required={true}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                                aria-invalid={
                                  (field.state.meta.errors?.length ?? 0) > 0 || undefined
                                }
                              />
                              {(field.state.meta.errors?.length ?? 0) > 0 && (
                                <div className="text-destructive mt-1 text-sm">
                                  {formError(field.state.meta.errors?.[0])}
                                </div>
                              )}
                            </>
                          )}
                        </form.Field>
                      </div>

                      <div className="mb-3">
                        <label className={labelClass}>Confirmation</label>
                        <form.Field name="confirmation">
                          {(field) => (
                            <>
                              <Input
                                type="password"
                                required={true}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                                aria-invalid={
                                  (field.state.meta.errors?.length ?? 0) > 0 || undefined
                                }
                              />
                              {(field.state.meta.errors?.length ?? 0) > 0 && (
                                <div className="text-destructive mt-1 text-sm">
                                  {formError(field.state.meta.errors?.[0])}
                                </div>
                              )}
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
