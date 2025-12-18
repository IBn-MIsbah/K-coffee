// components/forms/LoginForm.tsx
"use client";
import { Coffee, Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client"; // Use the client library
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { FieldDescription, Field, FieldLabel } from "../ui/field";
import { toast } from "sonner";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // 1. CALL THE CLIENT LIBRARY DIRECTLY
      const result = await signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      });

      if (result.error) {
        setError(result.error.message || "Invalid email or password");
        toast.error(result.error.message, {
          duration: 3000,
        });
      } else {
        // 2. SUCCESSFUL LOGIN - SYNC COOKIE AND REDIRECT
        // We add a small delay to ensure the DB write is confirmed, like your register form
        toast.success("Login successfully!", {
          description: "Rdirecting to Dashboard...",
          duration: 3000,
        });
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 500);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
      <form onSubmit={handleSubmit} className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Coffee className="h-6 w-6 text-amber-600" />
          </div>
          <FieldDescription className="text-xl font-bold text-gray-900">
            K-Coffee Shop
          </FieldDescription>
        </div>

        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-500">Sign in to your account</p>
          </div>

          {/* {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )} */}

          <div className="space-y-6">
            <Field>
              <FieldLabel htmlFor="email">Email Address</FieldLabel>
              <Input id="email" name="email" type="email" />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? (
                    <EyeClosed className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </Field>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700"
              >
                {isSubmitting ? "Logging In..." : "Login"}
              </Button>
            </div>
          </div>

          <div className="text-center text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-amber-600">
              Sign up
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
