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
import { IconEye, IconEyeOff, IconLockOpen } from "@tabler/icons-react";
import { AlertCircleIcon } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
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
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "u",
    password: "",
    confirmPassword: "",
    subscribedToNewsletter: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Memoized function to calculate password strength (0 to 4)
  const passwordStrength = useMemo(() => {
    const pw = formData.password;
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }, [formData.password]);

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

  // Stabilize input changes to comply with ESLint exhaustive-deps
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({ ...prev, gender: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // 1. Match validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // 2. Strict strength validation (Score 4 required)
    if (passwordStrength < 4) {
      setError("Password is too weak. Please follow the requirements.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v2/shop/customers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            gender: formData.gender,
            password: formData.password,
            subscribedToNewsletter: formData.subscribedToNewsletter,
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
              <h1 className="mb-5 text-center text-2xl font-bold">Create an account</h1>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
                    <Select
                      value={formData.gender}
                      onValueChange={(v) => v && handleGenderChange(v)}
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue aria-label={formData.gender}>
                          {genderLabel(formData.gender)}
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
                  </div>
                  <div>
                    <label htmlFor="firstName" className={labelClass}>
                      First name *
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className={labelClass}>
                      Last name *
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="email" className={labelClass}>
                      Email address *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Password Field & Strength Bar */}
                  <div className="md:col-span-2">
                    <label htmlFor="password" className={labelClass}>
                      Password *
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                      </button>
                    </div>

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
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="newsletter"
                    checked={formData.subscribedToNewsletter}
                    onCheckedChange={(checked) =>
                      setFormData((p) => ({ ...p, subscribedToNewsletter: !!checked }))
                    }
                  />
                  <label htmlFor="newsletter" className="text-sm font-normal">
                    Subscribe to our newsletter
                  </label>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Register"}
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
