import Image from "next/image";
import Link from "next/link";

export default function StartScreen() {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Image Section */}
      <div className="relative hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="relative w-full h-full">
          <Image
            src="/images/steve_jobs.webp"
            alt="Steve Jobs"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-700/20" />
        </div>
      </div>

      {/* Right Side - Content Section */}
      <div className="flex flex-1 items-center justify-center px-8 py-12 lg:w-1/2 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center space-y-3">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl rotate-45 shadow-lg">
              <div className="rotate-[-45deg]">
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
                ENTREPRENEUR AI
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Discover the stories behind success
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h1 className="text-4xl font-bold text-gray-900">
                <span className="text-blue-600">Learn</span> from the Best
              </h1>
              <p className="text-gray-600 leading-relaxed">
                Explore the journeys of world-renowned entrepreneurs. Get
                instant insights about their strategies, failures, and successes
                through our AI-powered chatbot using advanced RAG technology.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="flex-1 flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
              <Link
                href="/about"
                className="flex-1 flex items-center justify-center px-6 py-3 text-base font-medium text-blue-600 bg-white border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Learn more
              </Link>
            </div>

            {/* Features */}
            <div className="pt-8 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
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
                    AI-Powered Insights
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get accurate information using RAG & GraphRAG
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
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
                    World-Class Entrepreneurs
                  </h3>
                  <p className="text-sm text-gray-600">
                    Learn from Steve Jobs, Elon Musk, and more
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
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
                    Real-Time Conversations
                  </h3>
                  <p className="text-sm text-gray-600">
                    Chat naturally and get instant responses
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
