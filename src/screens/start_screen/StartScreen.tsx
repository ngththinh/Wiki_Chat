import Image from "next/image";
import Link from "next/link";

export default function StartScreen() {
  return (
    <div className="flex min-h-screen">
      {/* Right Side - Content Section */}
      <div className="flex flex-1 items-center justify-center px-4 sm:px-8 py-8 sm:py-12 bg-white">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center space-y-3">
            <div className="flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl rotate-45 shadow-lg">
              <div className="-rotate-45">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 8L24 24M24 8L8 24"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                DANH NHÂN VIỆT AI
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Khám phá hành trình thành công của các danh nhân Việt
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                <span className="text-blue-600">Học hỏi</span> từ những người
                giỏi nhất
              </h1>
              <p className="text-gray-600 leading-relaxed">
                Khám phá câu chuyện thành công của các danh nhân nổi tiếng Việt
                Nam. Nhận thông tin nhanh chóng về chiến lược kinh doanh, thử
                thách và bí quyết thành công qua chatbot AI sử dụng công nghệ
                RAG tiên tiến.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/chat"
                className="flex-1 flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                Bắt đầu ngay
              </Link>
              <Link
                href="/about"
                className="flex-1 flex items-center justify-center px-6 py-3 text-base font-medium text-blue-600 bg-white border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Tìm hiểu thêm
              </Link>
            </div>

            {/* Features */}
            <div className="pt-8 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Trí tuệ nhân tạo tiên tiến
                  </h3>
                  <p className="text-sm text-gray-600">
                    Thông tin chính xác với công nghệ RAG & GraphRAG
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Danh nhân nổi tiếng Việt Nam
                  </h3>
                  <p className="text-sm text-gray-600">
                    Phạm Nhật Vượng, Trương Gia Bình, Nguyễn Thị Phương Thảo và
                    nhiều hơn
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Trò chuyện thời gian thực
                  </h3>
                  <p className="text-sm text-gray-600">
                    Chat tự nhiên và nhận phản hồi ngay lập tức
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
