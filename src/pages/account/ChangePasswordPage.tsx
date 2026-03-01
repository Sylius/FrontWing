import React, { useState } from "react";
import Default from "../../layouts/Default.tsx";
import AccountLayout from "../../layouts/Account.tsx";
import { useCustomer } from "../../context/CustomerContext.tsx";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/layout/Loader.tsx";
import { useFlashMessages } from "../../context/FlashMessagesContext.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const labelClass = "block text-sm font-medium mb-1";

const ChangePasswordPage: React.FC = () => {
  const { customer } = useCustomer();
  const navigate = useNavigate();
  const { addMessage } = useFlashMessages();

  const [currentPassword, setCurrentPassword] = useState<string>();
  const [newPassword, setNewPassword] = useState<string>();
  const [confirmation, setConfirmation] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!currentPassword?.trim()) e.currentPassword = "Required";
    if (!newPassword?.trim()) e.newPassword = "Required";
    if (!confirmation?.trim()) e.confirmNewPassword = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitted(true);
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}${customer && customer["@id"]}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
          body: JSON.stringify({
            newPassword,
            confirmNewPassword: confirmation,
            currentPassword,
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json();

        const formattedErrors: Record<string, string> = {};

        data.violations?.forEach(
          (error: { propertyPath: string; message: string }) => {
            formattedErrors[error.propertyPath] = error.message;
          },
        );

        setErrors(formattedErrors || {});
        throw new Error("Failed to submit order");
      }

      navigate("/account/dashboard");
      addMessage("success", "Password changed successfully");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Default>
      <AccountLayout>
        <div className="w-full md:w-3/4">
          <div className="mb-4">
            <h1>Change password</h1>
            Set a new password for your account
          </div>

          <div className="mb-4 relative">
            <Loader loading={loading}>
              <form method="post" onSubmit={handleChangePassword}>
                <div className="mb-4">
                  <div className="mb-3">
                    <label className={labelClass}>
                      Current password
                    </label>
                    <Input
                      type="password"
                      required={true}
                      aria-invalid={submitted && !!errors.currentPassword || undefined}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    {errors?.currentPassword && (
                      <div className="text-destructive text-sm mt-1">
                        {errors.currentPassword}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className={labelClass}>New password</label>
                    <Input
                      type="password"
                      required={true}
                      aria-invalid={submitted && !!errors.newPassword || undefined}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    {errors?.newPassword && (
                      <div className="text-destructive text-sm mt-1">
                        {errors.newPassword}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className={labelClass}>Confirmation</label>
                    <Input
                      type="password"
                      required={true}
                      aria-invalid={submitted && !!errors.confirmNewPassword || undefined}
                      onChange={(e) => setConfirmation(e.target.value)}
                    />
                    {errors?.confirmNewPassword && (
                      <div className="text-destructive text-sm mt-1">
                        {errors.confirmNewPassword}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  id="save-changes"
                >
                  Save changes
                </Button>
              </form>
            </Loader>
          </div>
        </div>
      </AccountLayout>
    </Default>
  );
};

export default ChangePasswordPage;
