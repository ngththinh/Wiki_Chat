"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InputField } from "@/components/common";
import authService from "@/lib/authService";
import { ROUTES, MESSAGES } from "@/constants";

type ForgotPasswordStep = "email" | "otp" | "password";

interface ForgotPasswordFormData {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

interface ValidationErrors {
  email?: string;
  otp?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

// Validation functions
function validateEmail(email: string): string | undefined {
  if (!email.trim()) {
    return "Vui lòng nhập email";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Email không hợp lệ";
  }
  return undefined;
}

// Translate error messages from backend
function translateErrorMessage(errorMsg: string): string {
  const translations: Record<string, string> = {
    "Invalid or expired OTP": "OTP không hợp lệ hoặc đã hết hạn",
    "Invalid OTP": "OTP không hợp lệ",
    "OTP expired": "OTP đã hết hạn",
  };

  for (const [eng, vi] of Object.entries(translations)) {
    if (errorMsg.includes(eng)) {
      return errorMsg.replace(eng, vi);
    }
  }

  return errorMsg;
}

function validateOtp(otp: string): string | undefined {
  if (!otp.trim()) {
    return "Vui lòng nhập OTP";
  }
  if (otp.length < 4) {
    return "OTP phải có ít nhất 4 ký tự";
  }
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password) {
    return "Vui lòng nhập mật khẩu";
  }
  if (password.length < 6) {
    return "Mật khẩu phải có ít nhất 6 ký tự";
  }
  return undefined;
}

function validatePasswordMatch(password: string, confirmPassword: string): string | undefined {
  if (password !== confirmPassword) {
    return "Mật khẩu xác nhận không khớp";
  }
  return undefined;
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<ForgotPasswordStep>("email");
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [resetToken, setResetToken] = useState<string>("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRequestOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailError = validateEmail(formData.email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    setIsLoading(true);
    setSuccessMessage("");

    try {
      const response = await authService.forgotPassword(formData.email);

      if (response.success) {
        setSuccessMessage("OTP đã được gửi đến email của bạn. Vui lòng kiểm tra email.");
        setStep("otp");
        setErrors({});
      } else {
        setErrors({
          general: translateErrorMessage(response.error || "Không thể gửi OTP. Vui lòng thử lại."),
        });
      }
    } catch (error) {
      setErrors({ general: "Lỗi kết nối. Vui lòng kiểm tra mạng." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const otpError = validateOtp(formData.otp);
    if (otpError) {
      setErrors({ otp: otpError });
      return;
    }

    setIsLoading(true);
    setSuccessMessage("");

    try {
      const response = await authService.verifyOtp(formData.email, formData.otp);

      if (response.success && response.data) {
        setResetToken(response.data.resetToken);
        setSuccessMessage("OTP xác thực thành công. Vui lòng nhập mật khẩu mới.");
        setStep("password");
        setErrors({});
      } else {
        setErrors({
          general: translateErrorMessage(response.error || "OTP không hợp lệ. Vui lòng thử lại."),
        });
      }
    } catch (error) {
      setErrors({ general: "Lỗi kết nối. Vui lòng kiểm tra mạng." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetNewPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setErrors({ newPassword: passwordError });
      return;
    }

    const confirmPasswordError = validatePasswordMatch(
      formData.newPassword,
      formData.confirmPassword,
    );
    if (confirmPasswordError) {
      setErrors({ confirmPassword: confirmPasswordError });
      return;
    }

    setIsLoading(true);
    setSuccessMessage("");

    try {
      const response = await authService.setNewPassword(
        resetToken,
        formData.newPassword,
        formData.confirmPassword,
      );

      if (response.success) {
        setSuccessMessage("Mật khẩu đã được cập nhật thành công!");
        setErrors({});
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push(ROUTES.LOGIN);
        }, 2000);
      } else {
        setErrors({
          general: translateErrorMessage(response.error || "Không thể cập nhật mật khẩu. Vui lòng thử lại."),
        });
      }
    } catch (error) {
      setErrors({ general: "Lỗi kết nối. Vui lòng kiểm tra mạng." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackStep = () => {
    if (step === "otp") {
      setStep("email");
      setErrors({});
      setSuccessMessage("");
    } else if (step === "password") {
      setStep("otp");
      setErrors({});
      setSuccessMessage("");
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

      {/* Decorative vertical lines - hidden on mobile */}
      <div className="absolute left-[15%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-300/40 to-transparent hidden sm:block" />
      <div className="absolute right-[15%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-300/40 to-transparent hidden sm:block" />

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
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-2 sm:space-x-3 opacity-80 hover:opacity-100 transition-opacity duration-300"
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

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center pt-20 sm:pt-24 pb-8 sm:pb-16 px-4 sm:px-6">
          <div className="w-full max-w-md">
            {/* Editorial Header */}
            <div className="text-center mb-8 sm:mb-12">
              <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-8 sm:w-12 h-px bg-slate-300" />
                <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                  Khôi phục mật khẩu
                </span>
                <div className="w-8 sm:w-12 h-px bg-slate-300" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-3 tracking-tight">
                Khôi phục & khám phá tiếp
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                Mất mật khẩu, không mất hành trình
                <br />
                <span className="italic">lịch sử của bạn</span>
              </p>
            </div>

            {/* Glass Form Container */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm border border-slate-200/80 shadow-sm" />
              <div className="relative p-5 sm:p-8">
                {/* Success Message */}
                {successMessage && (
                  <p className="mb-6 text-emerald-600 text-sm">
                    {successMessage}
                  </p>
                )}

                {/* Error Message */}
                {errors.general && (
                  <p className="mb-6 text-red-600 text-sm">
                    {errors.general}
                  </p>
                )}

              {/* Step 1: Email */}
              {step === "email" && (
                <form onSubmit={handleRequestOtp} className="space-y-6">
                  <div>
                    <InputField
                      label="Email"
                      type="email"
                      name="email"
                      placeholder="Nhập email của bạn"
                      value={formData.email}
                      onChange={handleInputChange}
                      error={errors.email}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full py-4 bg-slate-900 text-white overflow-hidden disabled:bg-slate-400 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-slate-700 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <span className="relative flex items-center justify-center gap-2 text-sm font-medium tracking-wide">
                      {isLoading ? "Đang gửi..." : "Gửi OTP"}
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
                </form>
              )}

              {/* Step 2: OTP */}
              {step === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div>
                    <InputField
                      label="Mã OTP"
                      type="text"
                      name="otp"
                      placeholder="Nhập mã OTP"
                      value={formData.otp}
                      onChange={handleInputChange}
                      error={errors.otp}
                      required
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Email: {formData.email}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group relative w-full py-4 bg-slate-900 text-white overflow-hidden disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                      <div className="absolute inset-0 bg-slate-700 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                      <span className="relative flex items-center justify-center gap-2 text-sm font-medium tracking-wide">
                        {isLoading ? "Đang xác thực..." : "Xác Thực OTP"}
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

                    <button
                      type="button"
                      onClick={handleBackStep}
                      className="w-full py-3 px-4 border border-slate-300 text-slate-900 font-medium hover:bg-slate-50 transition-colors duration-200"
                    >
                      Quay Lại
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Password */}
              {step === "password" && (
                <form onSubmit={handleSetNewPassword} className="space-y-6">
                  <div>
                    <InputField
                      label="Mật khẩu mới"
                      type="password"
                      name="newPassword"
                      placeholder="Nhập mật khẩu mới"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      error={errors.newPassword}
                      required
                    />
                  </div>

                  <div>
                    <InputField
                      label="Xác nhận mật khẩu"
                      type="password"
                      name="confirmPassword"
                      placeholder="Xác nhận mật khẩu"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      error={errors.confirmPassword}
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group relative w-full py-4 bg-slate-900 text-white overflow-hidden disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                      <div className="absolute inset-0 bg-slate-700 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                      <span className="relative flex items-center justify-center gap-2 text-sm font-medium tracking-wide">
                        {isLoading ? "Đang cập nhật..." : "Cập Nhật Mật Khẩu"}
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

                    <button
                      type="button"
                      onClick={handleBackStep}
                      className="w-full py-3 px-4 border border-slate-300 text-slate-900 font-medium hover:bg-slate-50 transition-colors duration-200"
                    >
                      Quay Lại
                    </button>
                  </div>
                </form>
              )}

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <p className="text-center text-slate-600 text-sm">
                  Đã nhớ mật khẩu?{" "}
                  <Link href={ROUTES.LOGIN} className="text-slate-900 font-semibold hover:underline">
                    Đăng nhập
                  </Link>
                </p>
              </div>
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
