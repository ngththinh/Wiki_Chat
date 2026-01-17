interface ChatSidebarProps {
  title: string;
  subtitle: string;
  question: string;
  answer: {
    intro: string;
    points: Array<{
      title: string;
      content: string;
    }>;
    conclusion: string;
  };
}

export default function ChatSidebar({
  title,
  subtitle,
  question,
  answer,
}: ChatSidebarProps) {
  return (
    <div className="relative hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400 p-12">
      <div className="flex flex-col justify-between w-full">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-white/80"></div>
          <h1 className="text-white text-xl font-bold tracking-wider">
            ENTREPRENEUR AI
          </h1>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <div>
            <h2 className="text-white text-5xl font-bold leading-tight">
              {title}
            </h2>
          </div>

          <div className="space-y-6 text-white/90 text-sm">
            <p>{question}</p>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-white/20 rounded-full">
                  ENTREPRENEUR AI ®
                </span>
              </div>
              <p className="text-sm leading-relaxed">{answer.intro}</p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                {answer.points.map((point, index) => (
                  <li key={index}>
                    <strong>{point.title}:</strong> {point.content}
                  </li>
                ))}
              </ol>
              <p className="text-xs opacity-75">{answer.conclusion}</p>
            </div>
          </div>

          {/* Chat Input */}
          <div className="relative">
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-full px-6 py-4">
              <button className="text-white/60 hover:text-white">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
              <input
                type="text"
                placeholder={subtitle}
                className="flex-1 bg-transparent text-white placeholder-white/50 outline-none"
              />
              <button className="text-white/60 hover:text-white">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
              </button>
              <button className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Dots */}
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-white/40"></div>
          <div className="w-2 h-2 rounded-full bg-white/80"></div>
        </div>
      </div>
    </div>
  );
}
