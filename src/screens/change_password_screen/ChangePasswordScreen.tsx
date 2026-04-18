"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InputField } from "@/components/common";
import authService from "@/lib/authService";
import { ROUTES } from "@/constants";

interface ChangePasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ValidationErrors {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

type PasswordFieldName = keyof ChangePasswordFormData;

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,64}$/;

function validateChangePasswordForm(
  data: ChangePasswordFormData,
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.oldPassword) {
    errors.oldPassword = "Vui lòng nhập mật khẩu hiện tại";
  }

  if (!data.newPassword) {
    errors.newPassword = "Vui lòng nhập mật khẩu mới";
  } else if (!STRONG_PASSWORD_REGEX.test(data.newPassword)) {
    errors.newPassword =
      "Mật khẩu mới 8-64 ký tự, gồm chữ hoa, chữ thường, số, ký tự đặc biệt và không chứa khoảng trắng";
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = "Vui lòng nhập xác nhận mật khẩu";
  } else if (data.confirmPassword !== data.newPassword) {
    errors.confirmPassword = "Mật khẩu xác nhận không khớp";
  }

  if (
    data.oldPassword &&
    data.newPassword &&
    data.oldPassword === data.newPassword
  ) {
    errors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
  }

  return errors;
}

function getFieldError(
  fieldName: PasswordFieldName,
  data: ChangePasswordFormData,
): string {
  if (fieldName === "oldPassword") {
    if (!data.oldPassword) return "Vui lòng nhập mật khẩu hiện tại";
    if (data.oldPassword.length < 8) {
      return "Mật khẩu hiện tại phải có ít nhất 8 ký tự";
    }
    return "";
  }

  if (fieldName === "newPassword") {
    if (!data.newPassword) return "Vui lòng nhập mật khẩu mới";
    if (!STRONG_PASSWORD_REGEX.test(data.newPassword)) {
      return "Mật khẩu mới 8-64 ký tự, gồm chữ hoa, chữ thường, số, ký tự đặc biệt và không chứa khoảng trắng";
    }
    if (data.oldPassword && data.oldPassword === data.newPassword) {
      return "Mật khẩu mới phải khác mật khẩu hiện tại";
    }
    return "";
  }

  if (fieldName === "confirmPassword") {
    if (!data.confirmPassword) return "Vui lòng nhập xác nhận mật khẩu";
    if (data.confirmPassword !== data.newPassword) {
      return "Mật khẩu xác nhận không khớp";
    }
    return "";
  }

  return "";
}

export default function ChangePasswordScreen() {
  const router = useRouter();
  type RouteValue = (typeof ROUTES)[keyof typeof ROUTES];
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [redirectTarget, setRedirectTarget] = useState<RouteValue>(ROUTES.CHAT);
  const [touchedFields, setTouchedFields] = useState<
    Partial<Record<PasswordFieldName, boolean>>
  >({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const user = authService.getCurrentUser();

    if (!authService.isAuthenticated()) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    const isAdmin = user?.role?.toLowerCase() === "admin";
    setRedirectTarget(isAdmin ? ROUTES.ADMIN : ROUTES.CHAT);
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as PasswordFieldName;
    const nextFormData = {
      ...formData,
      [fieldName]: value,
    };

    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }));
    }

    if (!hasSubmitted && !touchedFields[fieldName]) {
      return;
    }

    setErrors((prev) => {
      const nextErrors: ValidationErrors = {
        ...prev,
        [fieldName]: getFieldError(fieldName, nextFormData),
      };

      // Re-validate dependent fields when password changes.
      if (fieldName === "newPassword") {
        if (hasSubmitted || touchedFields.confirmPassword) {
          nextErrors.confirmPassword = getFieldError(
            "confirmPassword",
            nextFormData,
          );
        }
        if (hasSubmitted || touchedFields.oldPassword) {
          nextErrors.oldPassword = getFieldError("oldPassword", nextFormData);
        }
      }

      return nextErrors;
    });
  };

  const handleFieldBlur = (fieldName: PasswordFieldName) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));

    setErrors((prev) => ({
      ...prev,
      [fieldName]: getFieldError(fieldName, formData),
      ...(fieldName === "newPassword" &&
      (hasSubmitted || touchedFields.confirmPassword)
        ? { confirmPassword: getFieldError("confirmPassword", formData) }
        : {}),
    }));
  };

  const validateBeforeSubmit = (data: ChangePasswordFormData) => {
    const validationErrors = validateChangePasswordForm(data);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setHasSubmitted(true);
    setTouchedFields({
      oldPassword: true,
      newPassword: true,
      confirmPassword: true,
    });

    const isValid = validateBeforeSubmit(formData);
    if (!isValid) {
      return;
    }

    setIsLoading(true);
    setSuccessMessage("");

    try {
      const response = await authService.changePassword(
        formData.oldPassword,
        formData.newPassword,
        formData.confirmPassword,
      );

      if (!response.success) {
        setErrors({
          general:
            response.error || "Không thể đổi mật khẩu. Vui lòng thử lại.",
        });
        return;
      }

      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
      setTouchedFields({});
      setHasSubmitted(false);
      setSuccessMessage("Đổi mật khẩu thành công.");

      setTimeout(() => {
        router.push(redirectTarget);
      }, 1200);
    } catch {
      setErrors({ general: "Lỗi kết nối. Vui lòng kiểm tra mạng." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, #FDFCFB 0%, #FAF9F7 25%, #F5F5F4 50%, #F1F5F9 80%, #E2E8F0 100%)",
        }}
      />

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

      <div className="absolute inset-0 bg-slate-700/[0.02] backdrop-blur-[0.3px]" />
      <div className="absolute left-[15%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-300/40 to-transparent hidden sm:block" />
      <div className="absolute right-[15%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-300/40 to-transparent hidden sm:block" />

      <div className="relative z-10 min-h-screen flex flex-col">
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
              href={ROUTES.HOME}
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

            <Link
              href={redirectTarget}
              className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              Quay lại
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-24 sm:py-28">
          <div className="w-full max-w-md bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-900/5">
            <div className="px-6 sm:px-8 py-6 sm:py-7 border-b border-slate-100">
              <h1 className="text-2xl font-serif font-semibold text-slate-800">
                Đổi mật khẩu
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Cập nhật mật khẩu để bảo mật tài khoản của bạn.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="px-6 sm:px-8 py-6 space-y-4"
            >
              {errors.general && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {errors.general}
                </div>
              )}

              {successMessage && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {successMessage}
                </div>
              )}

              <InputField
                label="Mật khẩu hiện tại"
                type="password"
                name="oldPassword"
                required
                value={formData.oldPassword}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur("oldPassword")}
                error={errors.oldPassword}
              />

              <InputField
                label="Mật khẩu mới"
                type="password"
                name="newPassword"
                required
                value={formData.newPassword}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur("newPassword")}
                error={errors.newPassword}
              />

              <p className="text-xs text-slate-500 -mt-1">
                Mật khẩu mới cần có chữ hoa, chữ thường, số, ký tự đặc biệt và
                dài từ 8 đến 64 ký tự.
              </p>

              <InputField
                label="Xác nhận mật khẩu mới"
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur("confirmPassword")}
                error={errors.confirmPassword}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed transition-colors text-sm font-medium tracking-wide"
              >
                {isLoading ? "Đang cập nhật..." : "Xác nhận đổi mật khẩu"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
