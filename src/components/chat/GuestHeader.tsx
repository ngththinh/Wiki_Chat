"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants";

export default function GuestHeader() {
  const router = useRouter();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Guest Mode Badge */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-linear-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="font-semibold">Chế độ Khách</span>
          </div>
          <p className="text-sm text-gray-600">
            Đăng nhập để lưu lịch sử trò chuyện của bạn
          </p>
        </div>

        {/* Login/Register Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push(ROUTES.LOGIN)}
            className="px-6 py-2.5 text-blue-600 font-medium border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Đăng nhập
          </button>
          <button
            onClick={() => router.push(ROUTES.REGISTER)}
            className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Đăng ký
          </button>
        </div>
      </div>
    </div>
  );
}
