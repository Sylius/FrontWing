import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { IconLockOpen } from "@tabler/icons-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomer } from "../context/CustomerContext";
import Default from "../layouts/Default";

const labelClass = "block text-sm font-medium mb-1";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refetchCustomer } = useCustomer();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/customers/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          const errData: { message?: string } = await response.json();
          throw new Error(errData.message || "Invalid credentials");
        }
        throw new Error("Invalid credentials");
      }

      const data: { token: string; customer: string } = await response.json();

      localStorage.setItem("jwtToken", data.token);
      localStorage.setItem("userUrl", data.customer);

      await refetchCustomer();

      navigate("/account/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Default>
      <div className="container my-auto">
        <div className="my-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex items-center justify-center lg:order-2">
            <div className="w-full max-w-md py-8 lg:py-20">
              <h1 className="mb-5 text-2xl font-bold">Login</h1>
              <form onSubmit={handleLogin} noValidate>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>
                      <div className="font-bold">Error</div>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="mb-5">
                  <div className="mb-3">
                    <label htmlFor="_username" className={labelClass}>
                      Username
                    </label>
                    <Input
                      type="text"
                      id="_username"
                      name="_username"
                      required
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="_password" className={labelClass}>
                      Password
                    </label>
                    <Input
                      type="password"
                      id="_password"
                      name="_password"
                      required
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox id="_remember_me" name="_remember_me" value="1" />
                    <label className="text-sm" htmlFor="_remember_me">
                      Remember me
                    </label>
                  </div>
                </div>

                <div className="mb-2">
                  <Button type="submit" className="w-full" id="login-button" disabled={loading}>
                    Login
                  </Button>
                </div>

                <input
                  type="hidden"
                  name="_csrf_shop_security_token"
                  value="9e18bb83adf067700.UOv6APT67VeoTTEJqhaKHvRW9u1qj7WrPIqcU94-HXc.YN7NTJuq2xCZAQJFz3PaeNk_g6RTyvjefdrfEIx0WRMhucotpImUbsY7aA"
                />
              </form>

              <div className="text-center">
                <a
                  className="text-primary text-sm hover:underline"
                  href="/en_US/forgotten-password"
                >
                  Forgot password?
                </a>
              </div>
            </div>
          </div>

          <div className="lg:order-1">
            <div className="bg-muted flex h-full flex-col items-center justify-center rounded-2xl p-3">
              <div className="text-center">
                <div className="mb-3 flex justify-center">
                  <IconLockOpen stroke={2} size={144} color={"#22b99a"} />
                </div>
                <h2>Don't have an account?</h2>
                <a
                  className="text-primary hover:underline"
                  id="register-here-button"
                  href="/en_US/register"
                >
                  Register here
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Default>
  );
};

export default LoginPage;
