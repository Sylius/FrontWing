import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerSchema } from "@/schemas/auth";
import { formError } from "@/lib/utils";
import { useForm, useStore } from "@tanstack/react-form";
import { IconEye, IconEyeOff, IconLockOpen } from "@tabler/icons-react";
import { AlertCircleIcon } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Default from "../layouts/Default";

const labelClass = "block text-sm font-medium mb-1";

const genderOptions = [
  { value: "u", label: "Unspecified" },
  { value: "m", label: "Male" },
  { value: "f", label: "Female" },
];

const genderLabel = (gender: string) => {
  const option = genderOptions.find((opt) => opt.value === gender);
  return option ? option.label : "Unspecified";
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      gender: "u",
      password: "",
      confirmPassword: "",
      subscribedToNewsletter: false,
    },
    validators: { onSubmit: registerSchema },
    onSubmit: async ({ value }) => {
      setError(null);

      // Strict strength validation (Score 4 required)
      const pw = value.password;
      let score = 0;
      if (pw.length >= 8) score++;
      if (/[A-Z]/.test(pw)) score++;
      if (/[0-9]/.test(pw)) score++;
      if (/[^A-Za-z0-9]/.test(pw)) score++;

      if (score < 4) {
        setError("Password is too weak. Please follow the requirements.");
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/customers`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firstName: value.firstName,
              lastName: value.lastName,
              email: value.email,
              gender: value.gender,
              password: value.password,
              subscribedToNewsletter: value.subscribedToNewsletter,
            }),
          }
        );

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData["hydra:description"] ?? errData.message ?? "Registration failed");
        }

        toast.success("Account created successfully!");
        navigate("/login");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    },
  });

  // Subscribe to password field value for strength indicator
  const passwordValue = useStore(form.store, (s) => s.values.password);

  // Memoized password strength calculation (0 to 4)
  const passwordStrength = useMemo(() => {
    const pw = passwordValue;
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }, [passwordValue]);

  // Helper to get bar color based on strength
  const getStrengthColor = (score: number) => {
    switch (score) {
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-green-500";
      default:
        return "bg-gray-200";
    }
  };

  return (
    <Default>
      <div className="container my-auto">
        <div className="my-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex items-center justify-center lg:order-2">
            <div className="w-full max-w-md py-8 lg:py-20">
              <h1 className="mb-5 text-center text-2xl font-bold">Create an account</h1>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit();
                }}
                noValidate
                className="space-y-4"
              >
                {error && (
                  <Alert variant="destructive">
                    <AlertCircleIcon />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Personal Info */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>Gender *</label>
                    <form.Field name="gender">
                      {(field) => (
                        <Select
                          value={field.state.value}
                          onValueChange={(val) => field.handleChange(val ?? "")}
                          required
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue aria-label={field.state.value}>
                              {genderLabel(field.state.value)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {genderOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </form.Field>
                  </div>

                  <div>
                    <label htmlFor="firstName" className={labelClass}>
                      First name *
                    </label>
                    <form.Field name="firstName">
                      {(field) => (
                        <>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            required
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

                  <div>
                    <label htmlFor="lastName" className={labelClass}>
                      Last name *
                    </label>
                    <form.Field name="lastName">
                      {(field) => (
                        <>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            required
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

                  <div className="md:col-span-2">
                    <label htmlFor="email" className={labelClass}>
                      Email address *
                    </label>
                    <form.Field name="email">
                      {(field) => (
                        <>
                          <Input
                            id="email"
                            type="email"
                            name="email"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            required
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

                  {/* Password Field & Strength Bar */}
                  <div className="md:col-span-2">
                    <label htmlFor="password" className={labelClass}>
                      Password *
                    </label>
                    <form.Field name="password">
                      {(field) => (
                        <>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              name="password"
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                              onBlur={field.handleBlur}
                              className="pr-10"
                              required
                              aria-invalid={(field.state.meta.errors?.length ?? 0) > 0 || undefined}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
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

                    {/* Visual Strength Indicator */}
                    <div className="mt-2 flex h-1 gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                            passwordStrength >= step
                              ? getStrengthColor(passwordStrength)
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Use 8+ characters with mixed case, numbers, and symbols.
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="confirmPassword" className={labelClass}>
                      Confirm password *
                    </label>
                    <form.Field name="confirmPassword">
                      {(field) => (
                        <>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirmPassword"
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                              onBlur={field.handleBlur}
                              required
                              aria-invalid={(field.state.meta.errors?.length ?? 0) > 0 || undefined}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showConfirmPassword ? (
                                <IconEyeOff size={18} />
                              ) : (
                                <IconEye size={18} />
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
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <form.Field name="subscribedToNewsletter">
                    {(field) => (
                      <Checkbox
                        id="newsletter"
                        checked={field.state.value ?? false}
                        onCheckedChange={(checked) => field.handleChange(!!checked)}
                      />
                    )}
                  </form.Field>
                  <label htmlFor="newsletter" className="text-sm font-normal">
                    Subscribe to our newsletter
                  </label>
                </div>

                <Button type="submit" className="w-full" disabled={form.state.isSubmitting}>
                  {form.state.isSubmitting ? "Creating account..." : "Register"}
                </Button>

                <p className="text-muted-foreground text-center text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary font-semibold hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          </div>

          <div className="lg:order-1">
            <div className="bg-muted flex h-full flex-col items-center justify-center rounded-2xl p-3">
              <div className="text-center">
                <div className="mb-3 flex justify-center">
                  <IconLockOpen stroke={2} size={144} color={"#22b99a"} />
                </div>
                <h2 className="text-xl font-semibold">Already have an account?</h2>
                <Link
                  to="/login"
                  className="text-primary font-medium hover:underline"
                  id="login-here-button"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Default>
  );
};

export default RegisterPage;
