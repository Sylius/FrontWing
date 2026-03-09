import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/schemas/auth";
import { formError } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import { IconEye, IconEyeOff, IconLockOpen } from "@tabler/icons-react";
import React, { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCustomer } from "../context/CustomerContext";
import Default from "../layouts/Default";

const labelClass = "block text-sm font-medium mb-1";

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { refetchCustomer } = useCustomer();

  // Handle visibility toggle
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      remember_me: false,
    },
    validators: { onSubmit: loginSchema },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/customers/token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: value.email, password: value.password }),
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
      }
    },
  });

  return (
    <Default>
      <div className="container my-auto">
        <div className="my-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex items-center justify-center lg:order-2">
            <div className="w-full max-w-md py-8 lg:py-20">
              <h1 className="mb-5 text-2xl font-bold">Login</h1>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit();
                }}
                noValidate
              >
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
                      Username / Email
                    </label>
                    <form.Field name="email">
                      {(field) => (
                        <>
                          <Input
                            type="text"
                            id="_username"
                            name="_username"
                            value={field.state.value}
                            required
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            aria-invalid={(field.state.meta.errors?.length ?? 0) > 0 || undefined}
                          />
                          {(field.state.meta.errors?.length ?? 0) > 0 && (
                            <span className="text-destructive text-sm">
                              {formError(field.state.meta.errors?.[0])}
                            </span>
                          )}
                        </>
                      )}
                    </form.Field>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="_password" className={labelClass}>
                      Password
                    </label>
                    <form.Field name="password">
                      {(field) => (
                        <>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              id="_password"
                              name="_password"
                              value={field.state.value}
                              required
                              onChange={(e) => field.handleChange(e.target.value)}
                              onBlur={field.handleBlur}
                              className="pr-10"
                              aria-invalid={(field.state.meta.errors?.length ?? 0) > 0 || undefined}
                            />
                            <button
                              type="button"
                              onClick={togglePasswordVisibility}
                              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 focus:outline-none"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? (
                                <IconEyeOff size={20} stroke={1.5} />
                              ) : (
                                <IconEye size={20} stroke={1.5} />
                              )}
                            </button>
                          </div>
                          {(field.state.meta.errors?.length ?? 0) > 0 && (
                            <span className="text-destructive text-sm">
                              {formError(field.state.meta.errors?.[0])}
                            </span>
                          )}
                        </>
                      )}
                    </form.Field>
                  </div>

                  <div className="flex items-center gap-2">
                    <form.Field name="remember_me">
                      {(field) => (
                        <Checkbox
                          id="_remember_me"
                          name="_remember_me"
                          checked={field.state.value ?? false}
                          onCheckedChange={(checked) => field.handleChange(!!checked)}
                        />
                      )}
                    </form.Field>
                    <label className="text-sm" htmlFor="_remember_me">
                      Remember me
                    </label>
                  </div>
                </div>

                <div className="mb-2">
                  <Button
                    type="submit"
                    className="w-full"
                    id="login-button"
                    disabled={form.state.isSubmitting}
                  >
                    {form.state.isSubmitting ? "Logging in..." : "Login"}
                  </Button>
                </div>

                <input
                  type="hidden"
                  name="_csrf_shop_security_token"
                  value="9e18bb83adf067700.UOv6APT67VeoTTEJqhaKHvRW9u1qj7WrPIqcU94-HXc.YN7NTJuq2xCZAQJFz3PaeNk_g6RTyvjefdrfEIx0WRMhucotpImUbsY7aA"
                />
              </form>

              <div className="text-center">
                <Link to="/forgot-password" className="text-primary text-sm hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:order-1">
            <div className="bg-muted flex h-full flex-col items-center justify-center rounded-2xl p-3">
              <div className="text-center">
                <div className="mb-3 flex justify-center">
                  <IconLockOpen stroke={2} size={144} color={"#22b99a"} />
                </div>
                <h2 className="text-xl font-semibold">Don't have an account?</h2>
                <Link
                  to="/register"
                  className="text-primary font-medium hover:underline"
                  id="register-here-button"
                >
                  Register here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Default>
  );
};

export default LoginPage;
