"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChatSidebar, SocialLoginButtons } from "@/components/auth";
import { InputField } from "@/components/common";
import authService from "@/lib/authService";

export default function LoginScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear errors when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = { email: "", password: "", general: "" };
    let isValid = true;

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({ email: "", password: "", general: "" });

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login(
        formData.email,
        formData.password
      );

      if (response.success) {
        // Redirect to chat page
        router.push("/chat");
      } else {
        setErrors((prev) => ({
          ...prev,
          general: response.error || "Login failed. Please try again.",
        }));
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: "An unexpected error occurred. Please try again.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const chatData = {
    title: "Welcome Back!\nContinue Your Journey.",
    subtitle: "Ask about any entrepreneur...",
    question: "What made Warren Buffett one of the most successful investors?",
    answer: {
      intro:
        "Warren Buffett's success comes from timeless investment principles and entrepreneurial mindset:",
      points: [
        {
          title: "Long-Term Thinking",
          content:
            "Buffett focuses on long-term value rather than short-term gains. He famously said 'Our favorite holding period is forever' and builds businesses for decades, not quarters.",
        },
        {
          title: "Value Investing Philosophy",
          content:
            "He buys great companies at fair prices, focusing on strong fundamentals, competitive advantages, and capable management teams rather than following market trends.",
        },
        {
          title: "Continuous Learning",
          content:
            "Buffett spends 80% of his day reading and thinking. He constantly studies businesses, markets, and learns from mistakes to refine his investment approach.",
        },
      ],
      conclusion:
        "His principles apply beyond investing—patience, continuous learning, and focus on fundamentals are universal entrepreneurial traits.",
    },
  };

  return (
    <div className="flex min-h-screen">
      <ChatSidebar {...chatData} />

      {/* Right Side - Login Form */}
      <div className="flex flex-1 items-center justify-center px-8 py-12 lg:w-1/2 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-sm text-gray-500">
              Login to continue your entrepreneurial learning journey
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            <InputField
              label="Email Address"
              type="email"
              name="email"
              placeholder="ex: email@example.com"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              required
            />

            <InputField
              label="Password"
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              required
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="remember" className="text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-blue-600 font-medium hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Or login with
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <SocialLoginButtons />
          </form>
        </div>
      </div>
    </div>
  );
}
