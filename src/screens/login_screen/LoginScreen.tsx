"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InputField } from "@/components/common";
import authService from "@/lib/authService";
import { ROUTES, MESSAGES } from "@/constants";

// Login form data type matching backend LoginDto
interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

interface ValidationErrors {
  username?: string;
  password?: string;
  general?: string;
}

// Validation function for login form
function validateLoginForm(data: LoginFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.username.trim()) {
    errors.username = "Vui lòng nhập tên đăng nhập";
  } else if (data.username.length < 3) {
    errors.username = "Tên đăng nhập phải có ít nhất 3 ký tự";
  }

  if (!data.password) {
    errors.password = "Vui lòng nhập mật khẩu";
  } else if (data.password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
  }

  return errors;
}

export default function LoginScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login(
        formData.username,
        formData.password,
      );

      if (response.success) {
        const user = authService.getCurrentUser();
        if (user?.role === "admin") {
          router.push(ROUTES.ADMIN);
        } else {
          router.push(ROUTES.CHAT);
        }
      } else {
        setErrors({
          general: response.error || MESSAGES.ERROR.LOGIN_FAILED,
        });
      }
    } catch (error) {
      setErrors({ general: MESSAGES.ERROR.GENERIC_ERROR });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background - Editorial gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, #FDFCFB 0%, #FAF9F7 25%, #F5F5F4 50%, #F1F5F9 80%, #E2E8F0 100%)",
        }}
      />

      {/* Editorial grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #475569 1px, transparent 1px),
            linear-gradient(to bottom, #475569 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glass editorial layer */}
      <div className="absolute inset-0 bg-slate-700/[0.02] backdrop-blur-[0.3px]" />

      {/* Decorative vertical lines */}
      <div className="absolute left-[15%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-300/40 to-transparent" />
      <div className="absolute right-[15%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-300/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header
          className="fixed top-0 left-0 right-0 z-50"
          style={{
            background:
              "linear-gradient(180deg, rgba(250,249,247,0.85) 0%, rgba(248,250,252,0.75) 100%)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderBottom: "1px solid rgba(148,163,184,0.12)",
          }}
        >
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-3 opacity-80 hover:opacity-100 transition-opacity duration-300"
            >
              <div className="relative">
                <div className="w-8 h-8 border border-slate-300/60" />
                <div className="absolute inset-1.5 bg-slate-700/90" />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-serif font-medium text-white/90">
                  W
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-serif font-medium text-slate-600 tracking-wide">
                  WikiChatbot
                </span>
                <span className="text-[9px] text-slate-400/80 uppercase tracking-[0.15em]">
                  Danh nhân Việt Nam
                </span>
              </div>
            </Link>

            <nav className="flex items-center space-x-6">
              <Link
                href="/register"
                className="group flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors duration-300"
              >
                <span className="border-b border-slate-400/50 group-hover:border-slate-600 pb-px">
                  Đăng ký
                </span>
                <svg
                  className="w-3 h-3 opacity-60 group-hover:opacity-100 transform group-hover:translate-x-0.5 transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center pt-24 pb-16 px-6">
          <div className="w-full max-w-md">
            {/* Editorial Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-12 h-px bg-slate-300" />
                <span className="text-[10px] text-slate-400 uppercase tracking-[0.3em]">
                  Đăng nhập
                </span>
                <div className="w-12 h-px bg-slate-300" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mb-3 tracking-tight">
                Chào mừng trở lại
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                Tiếp tục hành trình khám phá tri thức
                <br />
                <span className="italic">về các danh nhân Việt Nam</span>
              </p>
            </div>

            {/* Glass Form Container */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm border border-slate-200/80 shadow-sm" />
              <div className="relative p-8">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {errors.general && (
                    <div className="p-4 bg-red-50/80 border border-red-200/60 backdrop-blur-sm">
                      <p className="text-red-600 text-sm">{errors.general}</p>
                    </div>
                  )}

                  <InputField
                    label="Tên đăng nhập"
                    type="text"
                    name="username"
                    placeholder="vd: nguyenvana"
                    value={formData.username}
                    onChange={handleInputChange}
                    error={errors.username}
                    required
                  />

                  <InputField
                    label="Mật khẩu"
                    type="password"
                    name="password"
                    placeholder="Nhập mật khẩu"
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
                        className="w-4 h-4 text-slate-700 border-slate-300 focus:ring-slate-500"
                      />
                      <label
                        htmlFor="remember"
                        className="text-sm text-slate-600"
                      >
                        Ghi nhớ tôi
                      </label>
                    </div>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-slate-500 hover:text-slate-700 transition-colors border-b border-slate-300 hover:border-slate-500 pb-px"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>

                  {/* Submit Button - Editorial style */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full py-4 bg-slate-900 text-white overflow-hidden disabled:bg-slate-400 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-slate-700 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <span className="relative flex items-center justify-center gap-2 text-sm font-medium tracking-wide">
                      {isLoading ? MESSAGES.LOADING.LOGIN : "Đăng nhập"}
                      {!isLoading && (
                        <svg
                          className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      )}
                    </span>
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Hoặc
                    </span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  {/* Sign Up Link */}
                  <div className="text-center">
                    <p className="text-sm text-slate-500">
                      Chưa có tài khoản?{" "}
                      <Link
                        href={ROUTES.REGISTER}
                        className="text-slate-700 font-medium border-b border-slate-400 hover:border-slate-700 pb-px transition-colors"
                      >
                        Đăng ký miễn phí
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>

            {/* Bottom decorative element */}
            <div className="flex items-center justify-center gap-4 mt-12">
              <div className="w-8 h-px bg-slate-200" />
              <span className="text-[9px] text-slate-400 uppercase tracking-[0.2em]">
                WikiChatbot · 2025
              </span>
              <div className="w-8 h-px bg-slate-200" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
