"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InputField } from "@/components/common";
import authService, { RegisterDto } from "@/lib/authService";
import { ROUTES, MESSAGES } from "@/constants";

// Register form data type matching backend RegisterDto
interface RegisterFormData {
  username: string;
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface ValidationErrors {
  username?: string;
  email?: string;
  fullName?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  general?: string;
}

type RegisterFieldName = keyof RegisterFormData;

const USERNAME_REGEX =
  /^(?=.{3,30}$)(?!.*[._]{2})[a-zA-Z][a-zA-Z0-9._]*[a-zA-Z0-9]$/;
const EMAIL_REGEX =
  /^(?!.*\.\.)[A-Za-z0-9](?:[A-Za-z0-9._%+-]{0,62}[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z]{2,})+$/;
const FULL_NAME_REGEX =
  /^(?=.{2,100}$)(?!.*\s{2,})[\p{L}]+(?:[\s.'-][\p{L}]+)*$/u;
const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,64}$/;

const normalizeRegisterFormData = (
  data: RegisterFormData,
): RegisterFormData => ({
  ...data,
  username: data.username.trim(),
  email: data.email.trim().toLowerCase(),
  fullName: data.fullName.trim().replace(/\s+/g, " "),
});

// Validation function for register form
function validateRegisterForm(data: RegisterFormData): ValidationErrors {
  const errors: ValidationErrors = {};
  const normalizedData = normalizeRegisterFormData(data);

  // Username validation
  if (!normalizedData.username) {
    errors.username = "Vui lòng nhập tên đăng nhập";
  } else if (!USERNAME_REGEX.test(normalizedData.username)) {
    errors.username =
      "Tên đăng nhập 3-30 ký tự, bắt đầu bằng chữ cái, chỉ gồm chữ/số/dấu chấm/gạch dưới và không kết thúc bằng dấu";
  }

  // Email validation
  if (!normalizedData.email) {
    errors.email = "Vui lòng nhập email";
  } else if (!EMAIL_REGEX.test(normalizedData.email)) {
    errors.email = "Email không hợp lệ";
  }

  // Full name validation (optional)
  if (
    normalizedData.fullName &&
    !FULL_NAME_REGEX.test(normalizedData.fullName)
  ) {
    errors.fullName =
      "Họ tên chỉ gồm chữ cái và khoảng trắng hợp lệ, độ dài 2-100 ký tự";
  }

  // Password validation
  if (!data.password) {
    errors.password = "Vui lòng nhập mật khẩu";
  } else if (!STRONG_PASSWORD_REGEX.test(data.password)) {
    errors.password =
      "Mật khẩu 8-64 ký tự, gồm chữ hoa, chữ thường, số, ký tự đặc biệt và không chứa khoảng trắng";
  }

  // Confirm password validation
  if (!data.confirmPassword) {
    errors.confirmPassword = "Vui lòng nhập xác nhận mật khẩu";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Mật khẩu xác nhận không khớp";
  }

  // Terms validation
  if (!data.acceptTerms) {
    errors.terms = "Vui lòng đồng ý với điều khoản sử dụng";
  }

  return errors;
}

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<
    Partial<Record<RegisterFieldName, boolean>>
  >({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getErrorKeyFromFieldName = (
    fieldName: RegisterFieldName,
  ): keyof ValidationErrors => {
    if (fieldName === "acceptTerms") return "terms";
    return fieldName as keyof ValidationErrors;
  };

  const getFieldError = (
    fieldName: RegisterFieldName,
    data: RegisterFormData,
  ): string => {
    const validationErrors = validateRegisterForm(data);
    return validationErrors[getErrorKeyFromFieldName(fieldName)] || "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldName = name as RegisterFieldName;

    setFormData((prev) => {
      const nextData = {
        ...prev,
        [fieldName]: type === "checkbox" ? checked : value,
      };

      if (!touchedFields[fieldName] && !hasSubmitted) {
        return nextData;
      }

      setErrors((prevErrors) => ({
        ...prevErrors,
        [getErrorKeyFromFieldName(fieldName)]: getFieldError(
          fieldName,
          nextData,
        ),
        ...(fieldName === "password" || fieldName === "confirmPassword"
          ? {
              confirmPassword: getFieldError("confirmPassword", nextData),
            }
          : {}),
      }));

      return nextData;
    });
  };

  const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const fieldName = e.target.name as RegisterFieldName;
    if (!fieldName) return;

    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));

    const nextData = {
      ...formData,
      [fieldName]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    };

    setErrors((prev) => ({
      ...prev,
      [getErrorKeyFromFieldName(fieldName)]: getFieldError(fieldName, nextData),
      ...(fieldName === "password"
        ? { confirmPassword: getFieldError("confirmPassword", nextData) }
        : {}),
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHasSubmitted(true);
    setTouchedFields({
      username: true,
      email: true,
      fullName: true,
      password: true,
      confirmPassword: true,
      acceptTerms: true,
    });

    const normalizedData = normalizeRegisterFormData(formData);

    const validationErrors = validateRegisterForm(normalizedData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Create RegisterDto matching backend API
      const registerData: RegisterDto = {
        username: normalizedData.username,
        password: normalizedData.password,
        email: normalizedData.email,
        fullName: normalizedData.fullName || undefined,
      };

      const response = await authService.register(registerData);

      if (response.success) {
        router.push(ROUTES.CHAT);
      } else {
        setErrors({
          general: response.error || MESSAGES.ERROR.REGISTER_FAILED,
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
                href="/login"
                className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors duration-300 tracking-wide"
              >
                Đăng nhập
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center pt-20 sm:pt-24 pb-8 sm:pb-16 px-4 sm:px-6">
          <div className="w-full max-w-md">
            {/* Editorial Header */}
            <div className="text-center mb-6 sm:mb-10">
              <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-8 sm:w-12 h-px bg-slate-300" />
                <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                  Tạo tài khoản
                </span>
                <div className="w-8 sm:w-12 h-px bg-slate-300" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-3 tracking-tight">
                Bắt đầu hành trình
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                Đăng ký miễn phí để khám phá
                <br />
                <span className="italic">
                  di sản tri thức của dân tộc Việt Nam
                </span>
              </p>
            </div>

            {/* Glass Form Container */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm border border-slate-200/80 shadow-sm" />
              <div className="relative p-5 sm:p-8">
                <form className="space-y-5" onSubmit={handleSubmit} noValidate>
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
                    onBlur={handleFieldBlur}
                    error={errors.username}
                    required
                  />

                  <InputField
                    label="Địa chỉ Email"
                    type="email"
                    name="email"
                    placeholder="vd: email@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    error={errors.email}
                    required
                  />

                  <InputField
                    label="Họ và tên"
                    type="text"
                    name="fullName"
                    placeholder="vd: Nguyễn Văn A (tùy chọn)"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    error={errors.fullName}
                  />

                  <InputField
                    label="Mật khẩu"
                    type="password"
                    name="password"
                    placeholder="8+ ký tự, gồm hoa/thường/số/ký tự đặc biệt"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    error={errors.password}
                    required
                  />

                  <InputField
                    label="Xác nhận mật khẩu"
                    type="password"
                    name="confirmPassword"
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    error={errors.confirmPassword}
                    required
                  />

                  {/* Terms Checkbox */}
                  <div>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="terms"
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={handleInputChange}
                        onBlur={handleFieldBlur}
                        className="w-4 h-4 mt-0.5 text-slate-700 border-slate-300 focus:ring-slate-500"
                      />
                      <label
                        htmlFor="terms"
                        className="text-sm text-slate-600 leading-relaxed"
                      >
                        Tôi đồng ý với{" "}
                        <Link
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-700 border-b border-slate-400 hover:border-slate-700 pb-px transition-colors"
                        >
                          Điều khoản sử dụng
                        </Link>{" "}
                        và{" "}
                        <Link
                          href="/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-700 border-b border-slate-400 hover:border-slate-700 pb-px transition-colors"
                        >
                          Chính sách bảo mật
                        </Link>
                      </label>
                    </div>
                    {errors.terms && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.terms}
                      </p>
                    )}
                  </div>

                  {/* Submit Button - Editorial style */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full py-4 bg-slate-900 text-white overflow-hidden disabled:bg-slate-400 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-slate-700 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <span className="relative flex items-center justify-center gap-2 text-sm font-medium tracking-wide">
                      {isLoading ? MESSAGES.LOADING.REGISTER : "Tạo tài khoản"}
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
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Hoặc
                    </span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  {/* Login Link */}
                  <div className="text-center">
                    <p className="text-sm text-slate-500">
                      Đã có tài khoản?{" "}
                      <Link
                        href={ROUTES.LOGIN}
                        className="text-slate-700 font-medium border-b border-slate-400 hover:border-slate-700 pb-px transition-colors"
                      >
                        Đăng nhập
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>

            {/* Bottom decorative element */}
            <div className="flex items-center justify-center gap-4 mt-10">
              <div className="w-8 h-px bg-slate-200" />
              <span className="text-[9px] text-slate-400 uppercase tracking-[0.2em]">
                © 2025 WikiChatbot · SEP490.8 Team
              </span>
              <div className="w-8 h-px bg-slate-200" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
