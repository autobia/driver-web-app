"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import {
  EyeIcon,
  EyeSlashIcon,
  PhoneIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useLoginMutation } from "../../store/api/authApi";
import { setUser } from "../../store/slices/authSlice";
import { Button } from "../../components/ui/button";

interface LoginFormValues {
  phone: string;
  password: string;
}

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const dispatch = useDispatch();
  const [login] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Validation schema using Yup
  const validationSchema = Yup.object({
    phone: Yup.string()
      .required(t("phoneRequired") || "Phone number is required")
      .matches(
        /^[0-9]{9}$/,
        t("invalidSaudiPhone") ||
          "Please enter a valid Saudi phone number (9 digits)"
      )
      .test(
        "saudi-phone",
        t("invalidSaudiPhone") ||
          "Please enter a valid Saudi phone number (9 digits)",
        (value) => {
          if (!value) return false;
          // Saudi mobile numbers start with 5
          return value.startsWith("5");
        }
      ),
    password: Yup.string()
      .required(t("passwordRequired") || "Password is required")
      .min(6, t("passwordTooShort") || "Password must be at least 6 characters")
      .max(
        50,
        t("passwordTooLong") || "Password must be less than 50 characters"
      ),
  });

  const initialValues: LoginFormValues = {
    phone: "",
    password: "",
  };

  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    setSubmitStatus({ type: null, message: "" });

    // Make actual API call
    await login({
      phone: `+966${values.phone}`,
      password: values.password,
      grant_type: "password",
      is_staff: true,
      lang: "ar",
    }).unwrap();

    // Handle successful login - get user from localStorage (decoded from JWT)
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("authToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (storedUser && storedToken) {
      const user = JSON.parse(storedUser);
      dispatch(
        setUser({
          user,
          token: storedToken,
          refreshToken: storedRefreshToken || undefined,
        })
      );
    }

    setSubmitStatus({
      type: "success",
      message: t("loginSuccessful") || "Login successful! Redirecting...",
    });

    // Redirect after success
    setTimeout(() => {
      router.push("/");
    }, 1500);

    setSubmitting(false);
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-primary-50 to-neutral-100 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md mx-auto">
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-primary-100 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-primary-600 mb-2">
                {t("welcomeBack") || "Welcome Back"}
              </h1>
              <p className="text-neutral-600">
                {t("signInToContinue") || "Sign in to continue to your account"}
              </p>
            </div>

            {/* Status Message */}
            {submitStatus.type && (
              <div
                className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
                  submitStatus.type === "success"
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                {submitStatus.type === "success" ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
                )}
                <p
                  className={`text-sm font-medium ${
                    submitStatus.type === "success"
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >
                  {submitStatus.message}
                </p>
              </div>
            )}

            {/* Formik Form */}
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting, setFieldValue }) => (
                <Form className="space-y-6">
                  {/* Phone Number Input */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-neutral-700 mb-2"
                    >
                      {t("phoneNumber") || "Phone Number"}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <PhoneIcon className="h-5 w-5 text-neutral-400" />
                      </div>
                      <div className="absolute inset-y-0 left-8 flex items-center pl-2 pointer-events-none">
                        <span
                          className="text-neutral-600 font-medium px-1"
                          dir="ltr"
                        >
                          +966
                        </span>
                      </div>
                      <Field
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder={t("phonePlaceholder") || "501234567"}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          // Only allow numbers and limit to 9 digits
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 9);
                          setFieldValue("phone", value);
                        }}
                        className={`w-full pl-20 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-neutral-900 placeholder-neutral-400 ${
                          errors.phone && touched.phone
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-neutral-300 focus:border-primary-500 focus:ring-primary-200"
                        }`}
                        maxLength={9}
                      />
                    </div>
                    <ErrorMessage
                      name="phone"
                      component="p"
                      className="mt-1 text-sm text-red-600"
                    />
                  </div>

                  {/* Password Input */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-neutral-700 mb-2"
                    >
                      {t("password") || "Password"}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <LockClosedIcon className="h-5 w-5 text-neutral-400" />
                      </div>
                      <Field
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={
                          t("passwordPlaceholder") || "MySecurePassword123"
                        }
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-neutral-900 placeholder-neutral-400 ${
                          errors.password && touched.password
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-neutral-300 focus:border-primary-500 focus:ring-primary-200"
                        }`}
                      />
                      <Button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        variant="ghost"
                        size="icon"
                        className="absolute inset-y-0 right-0 h-full px-3 text-neutral-400 hover:text-neutral-600"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                    <ErrorMessage
                      name="password"
                      component="p"
                      className="mt-1 text-sm text-red-600"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="default"
                    size="lg"
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {t("signingIn") || "Signing In..."}
                      </div>
                    ) : (
                      t("signIn") || "Sign In"
                    )}
                  </Button>
                </Form>
              )}
            </Formik>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-neutral-500">
                {t("secureLogin") || "Secure login for authorized users only"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
