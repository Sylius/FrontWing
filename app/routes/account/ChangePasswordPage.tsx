import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Default from "../../layouts/Default";
import AccountLayout from "../../layouts/Account";
import { useCustomer } from "../../context/CustomerContext";
import { useLocalizedNavigate } from "~/hooks/useLocalizedNavigate";
import Loader from "../../components/layout/Loader";
import { useFlashMessages } from "../../context/FlashMessagesContext";

const ChangePasswordPage: React.FC = () => {
  const { t } = useTranslation("account");
  const { customer } = useCustomer();
  const navigate = useLocalizedNavigate();
  const { addMessage } = useFlashMessages();

  const [currentPassword, setCurrentPassword] = useState<string>();
  const [newPassword, setNewPassword] = useState<string>();
  const [confirmation, setConfirmation] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(
        `${window.ENV?.API_URL}${customer && customer["@id"]}/password`,
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
      addMessage("success", t("changePassword.success"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Default>
      <AccountLayout>
        <div className="col-12 col-md-9">
          <div className="mb-4">
            <h1>{t("changePassword.title")}</h1>
            {t("changePassword.subtitle")}
          </div>

          <div className="mb-4 position-relative">
            <Loader loading={loading}>
              <form method="post" onSubmit={handleChangePassword}>
                <div className="mb-4">
                  <div className="field mb-3 required">
                    <label className="form-label required">
                      {t("changePassword.current")}
                    </label>
                    <input
                      type="password"
                      required={true}
                      className="form-control"
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    {errors?.currentPassword && (
                      <div className="invalid-feedback d-block">
                        {errors.currentPassword}
                      </div>
                    )}
                  </div>

                  <div className="field mb-3 required">
                    <label className="form-label required">{t("changePassword.new")}</label>
                    <input
                      type="password"
                      required={true}
                      className="form-control"
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    {errors?.newPassword && (
                      <div className="invalid-feedback d-block">
                        {errors.newPassword}
                      </div>
                    )}
                  </div>

                  <div className="field mb-3 required">
                    <label className="form-label required">{t("changePassword.confirmation")}</label>
                    <input
                      type="password"
                      required={true}
                      className="form-control"
                      onChange={(e) => setConfirmation(e.target.value)}
                    />
                    {errors?.confirmNewPassword && (
                      <div className="invalid-feedback d-block">
                        {errors.confirmNewPassword}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  id="save-changes"
                >
                  {t("changePassword.submit")}
                </button>
              </form>
            </Loader>
          </div>
        </div>
      </AccountLayout>
    </Default>
  );
};

export default ChangePasswordPage;
