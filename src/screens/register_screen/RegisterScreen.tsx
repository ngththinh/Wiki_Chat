"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChatSidebar, SocialLoginButtons } from "@/components/auth";
import { InputField } from "@/components/common";
import authService from "@/lib/authService";
import { ROUTES, MESSAGES } from "@/constants";
import { REGISTER_CHAT_DATA } from "@/constants/chatData";
import {
  validateRegisterForm,
  type RegisterFormData,
  type ValidationErrors,
} from "@/utils/validation";

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user types
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validateRegisterForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register(
        formData.email,
        formData.password,
      );

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
    <div className="flex min-h-screen">
      <ChatSidebar {...REGISTER_CHAT_DATA} />

      {/* Right Side - Sign Up Form */}
      <div className="flex flex-1 items-center justify-center px-8 py-12 lg:w-1/2 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Đăng ký miễn phí
            </h1>
            <p className="text-sm text-gray-500">
              Tạo tài khoản để khám phá thế giới danh nhân Việt Nam
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
              label="Địa chỉ Email"
              type="email"
              name="email"
              placeholder="vd: email@example.com"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
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

            <InputField
              label="Xác nhận mật khẩu"
              type="password"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
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
                  Tôi đồng ý với{" "}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Điều khoản sử dụng
                  </Link>{" "}
                  và{" "}
                  <Link
                    href="/privacy"
                    className="text-blue-600 hover:underline"
                  >
                    Chính sách bảo mật
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
              {isLoading ? MESSAGES.LOADING.REGISTER : "Bắt đầu miễn phí"}
            </button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Đã có tài khoản?{" "}
                <Link
                  href={ROUTES.LOGIN}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Đăng nhập
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
                  Hoặc đăng ký bằng
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
