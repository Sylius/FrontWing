import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Default from "../layouts/Default";

const labelClass = "block text-sm font-medium mb-1";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/reset-password-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Intentionally silent: always show same message to prevent account enumeration
    } finally {
      setLoading(false);
    }
    toast.success("If this email exists, a reset link has been sent.");
    setEmail("");
  };

  return (
    <Default>
      <div className="container my-auto">
        <div className="mx-auto my-8 w-full max-w-md">
          <h1 className="mb-2 text-2xl font-bold">Forgot your password?</h1>
          <p className="text-muted-foreground mb-5 text-sm">
            Enter your email and we will send you a reset link.
          </p>
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-5">
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <Input
                id="email"
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button type="submit" className="mb-3 w-full" disabled={loading}>
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
