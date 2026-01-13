"use client";

import Link from "next/link";
import { ChatSidebar, SocialLoginButtons } from "@/components/auth";
import { InputField } from "@/components/common";

export default function RegisterScreen() {
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
          <form className="space-y-6">
            <InputField
              label="Email Address"
              type="email"
              placeholder="ex: email@example.com"
              required
            />

            <InputField
              label="Password"
              type="password"
              placeholder="Enter password"
              required
            />

            {/* Terms Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{" "}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Get started free
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
