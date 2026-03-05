import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Default from "../layouts/Default";

const labelClass = "block text-sm font-medium mb-1";

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/reset-password-requests/${token}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/merge-patch+json" },
          body: JSON.stringify({ newPassword, confirmNewPassword }),
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Default>
      <div className="container my-auto">
        <div className="mx-auto my-8 w-full max-w-md">
          <h1 className="mb-5 text-2xl font-bold">Reset your password</h1>
          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mb-3">
              <label htmlFor="newPassword" className={labelClass}>
                New password
              </label>
              <Input
                id="newPassword"
                type="password"
                name="newPassword"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="mb-5">
              <label htmlFor="confirmNewPassword" className={labelClass}>
                Confirm new password
              </label>
              <Input
                id="confirmNewPassword"
                type="password"
                name="confirmNewPassword"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              Reset password
            </Button>
          </form>
        </div>
      </div>
    </Default>
  );
};

export default ResetPasswordPage;
