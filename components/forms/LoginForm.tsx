"use client";
import { Coffee, Eye, EyeClosed } from "lucide-react";
import { FieldDescription, Field, FieldLabel } from "../ui/field";
import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";
import Link from "next/link";

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
        pending ? "bg-amber-400" : "bg-amber-600"
      } `}
      // variant={pending ? "disabled" : "primary"}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Logging In...
        </span>
      ) : (
        "Login"
      )}
    </Button>
  );
};

const LoginForm = ({ action }: { action: (formData: FormData) => void }) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
      <form action={action} className="p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Coffee className="h-6 w-6 text-amber-600" />
          </div>
          <FieldDescription className="text-xl font-bold text-gray-900">
            K-Coffee Shop
          </FieldDescription>
        </div>

        <div className="space-y-8">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-500">Sign in to your account to continue</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <Field>
              <FieldLabel htmlFor="email" className="text-gray-700 font-medium">
                Email Address
              </FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="h-12 px-4 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
              />
            </Field>

            <Field>
              <FieldLabel
                htmlFor="password"
                className="text-gray-700 font-medium"
              >
                Password
              </FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="h-12 px-4 pr-12 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeClosed className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </Field>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a
                href="#"
                className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <SubmitButton />
            </div>
          </div>

          {/* Divider */}
          {/* <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div> */}

          {/* Social Login (Optional) */}
          {/* <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 h-11 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#1877F2"
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                />
              </svg>
              <span className="font-medium text-gray-700">Facebook</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 h-11 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#4285F4"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#34A853"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-medium text-gray-700">Google</span>
            </button>
          </div> */}

          {/* Sign Up Link */}
          <div className="text-center text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-amber-600 hover:text-amber-700 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
