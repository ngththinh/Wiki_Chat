"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChatSidebar, SocialLoginButtons } from "@/components/auth";
import { InputField } from "@/components/common";
import authService from "@/lib/authService";

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    terms: "",
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
    const newErrors = {
      email: "",
      password: "",
      confirmPassword: "",
      terms: "",
      general: "",
    };
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

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    // Terms validation
    if (!formData.acceptTerms) {
      newErrors.terms = "You must accept the Terms of Service";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({
      email: "",
      password: "",
      confirmPassword: "",
      terms: "",
      general: "",
    });

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register(
        formData.email,
        formData.password
      );

      if (response.success) {
        // Redirect to chat page
        router.push("/chat");
      } else {
        setErrors((prev) => ({
          ...prev,
          general: response.error || "Registration failed. Please try again.",
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
    title: "Learn, Discover &\nSucceed with Entrepreneurs.",
    subtitle: "Ask about any entrepreneur...",
    question:
      "What traits do successful entrepreneurs like Elon Musk and Jeff Bezos share?",
    answer: {
      intro:
        "Great question! World-renowned entrepreneurs share several key traits that contributed to their extraordinary success:",
      points: [
        {
          title: "Visionary Thinking",
          content:
            "They see opportunities where others see problems. Elon Musk envisions Mars colonization, Steve Jobs revolutionized personal computing, and Jeff Bezos transformed retail.",
        },
        {
          title: "Risk-Taking & Resilience",
          content:
            "They're not afraid to fail. All three faced major setbacks but persevered. Bezos started Amazon in a garage, Jobs was fired from Apple, Musk nearly went bankrupt in 2008.",
        },
        {
          title: "Customer Obsession",
          content:
            'They focus intensely on creating value for customers. Bezos famously said "Start with the customer and work backwards."',
        },
      ],
      conclusion:
        "These traits helped them build world-changing companies. Discover insights from 100+ entrepreneurs in our knowledge base!",
    },
  };

  return (
    <div className="flex min-h-screen">
      <ChatSidebar {...chatData} />

      {/* Right Side - Sign Up Form */}
      <div className="flex flex-1 items-center justify-center px-8 py-12 lg:w-1/2 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Sign up with free trail
            </h1>
            <p className="text-sm text-gray-500">
              Empower your experience, sign up for a free account today
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

            <InputField
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
              required
            />

            {/* Terms Checkbox */}
            <div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-blue-600 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.terms && (
                <p className="text-red-500 text-sm mt-1">{errors.terms}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account..." : "Get started free"}
            </button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 font-medium hover:underline"
                >
                  Login
                </Link>
              </p>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or sign up</span>
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
