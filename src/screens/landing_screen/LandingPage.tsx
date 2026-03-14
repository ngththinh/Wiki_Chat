"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import authService from "@/lib/authService";

// ==================== DATA ====================
const CATEGORIES = [
  {
    id: 1,
    category: "Lịch sử",
    representative: "Hồ Chí Minh",
    years: "1890 – 1969",
    description:
      "Anh hùng giải phóng dân tộc, danh nhân văn hóa thế giới, người sáng lập nước Việt Nam Dân chủ Cộng hòa.",
    tagline: "Không có gì quý hơn độc lập, tự do.",
  },
  {
    id: 2,
    category: "Vua – Hoàng đế",
    representative: "Lý Thái Tổ",
    years: "974 – 1028",
    description:
      "Người sáng lập triều Lý, dời đô từ Hoa Lư về Thăng Long, mở ra kỷ nguyên thịnh trị.",
    tagline: "Vị vua mở đường cho thiên niên kỷ mới.",
  },
  {
    id: 3,
    category: "Kinh doanh – Thương nhân",
    representative: "Bạch Thái Bưởi",
    years: "1874 – 1932",
    description:
      "Ông vua đường thủy, nhà tư sản dân tộc tiên phong, biểu tượng tinh thần khởi nghiệp.",
    tagline: "Khởi nghiệp từ hai bàn tay trắng.",
  },
  {
    id: 4,
    category: "Giáo dục – Trí thức",
    representative: "Chu Văn An",
    years: "1292 – 1370",
    description:
      "Người thầy của muôn đời, biểu tượng cho đạo học và nhân cách cao quý.",
    tagline: "Thất trảm sớ và lòng trung chính.",
  },
  {
    id: 5,
    category: "Quân sự – Danh tướng",
    representative: "Võ Nguyên Giáp",
    years: "1911 – 2013",
    description:
      "Đại tướng huyền thoại, kiến trúc sư của chiến thắng Điện Biên Phủ.",
    tagline: "Vị tướng làm nên lịch sử thế kỷ 20.",
  },
  {
    id: 6,
    category: "Văn hóa – Nghệ thuật",
    representative: "Nguyễn Du",
    years: "1765 – 1820",
    description:
      "Đại thi hào dân tộc, tác giả Truyện Kiều – kiệt tác văn học Việt Nam.",
    tagline: "Ba trăm năm sau, câu thơ vẫn còn lay động.",
  },
];

// ==================== HEADER ====================
function Header() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncAuthState = () => {
      const user = authService.getCurrentUser();
      const hasToken = authService.isAuthenticated();
      setCurrentUser(user);
      setIsAuthenticated(hasToken);
    };

    syncAuthState();
    window.addEventListener("focus", syncAuthState);
    return () => window.removeEventListener("focus", syncAuthState);
  }, []);

  useEffect(() => {
    if (!isAccountMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isAccountMenuOpen]);

  const displayName =
    currentUser?.fullName ||
    currentUser?.username ||
    currentUser?.email?.split("@")[0] ||
    "Người dùng";
  const avatarLetter = String(displayName).trim().charAt(0).toUpperCase();
  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsAccountMenuOpen(false);
    router.push("/");
  };

  return (
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
            <div className="w-8 h-8 border border-slate-300/60 rounded-lg"></div>
            <div className="absolute inset-1.5 bg-slate-700/90 rounded-md"></div>
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

        <nav className="flex items-center space-x-3 sm:space-x-6">
          {isAuthenticated ? (
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                className="group flex items-center gap-2.5 px-2.5 sm:px-3 py-1.5 border border-slate-300/70 bg-white/70 hover:bg-white transition-colors rounded-lg"
                title="Tài khoản"
                aria-haspopup="menu"
                aria-expanded={isAccountMenuOpen}
              >
                <div className="w-7 h-7 rounded-md bg-slate-700 text-white text-[11px] font-medium flex items-center justify-center">
                  {avatarLetter || "U"}
                </div>
                <div className="hidden sm:flex items-center gap-2 leading-tight">
                  <span className="text-xs font-medium text-slate-700 max-w-[150px] truncate">
                    {displayName}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                      isAccountMenuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                  <Link
                    href="/chat"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100/80 transition-colors"
                  >
                    <span>Vào trò chuyện</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100/80 transition-colors"
                    >
                      <span>Quản trị hệ thống</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[11px] sm:text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors duration-300 tracking-wide"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="group flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors duration-300"
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
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

// ==================== HERO SECTION ====================
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 sm:pt-20 overflow-hidden">
      {/* Base gradient: ivory to soft blue-gray */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, #FDFCFB 0%, #FAF9F7 25%, #F5F5F4 50%, #F1F5F9 80%, #E2E8F0 100%)",
        }}
      ></div>

      {/* Subtle editorial grid pattern - opacity 4% */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #475569 1px, transparent 1px),
            linear-gradient(to bottom, #475569 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      ></div>

      {/* Glass editorial layer - subtle slate overlay */}
      <div className="absolute inset-0 bg-slate-700/[0.03] backdrop-blur-[0.5px]"></div>

      {/* Soft light vignette - top left */}
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] opacity-[0.08]"
        style={{
          background:
            "radial-gradient(circle, rgba(241,245,249,1) 0%, transparent 70%)",
        }}
      ></div>

      {/* Soft light vignette - bottom right */}
      <div
        className="absolute -bottom-48 -right-48 w-[800px] h-[800px] opacity-[0.06]"
        style={{
          background:
            "radial-gradient(circle, rgba(226,232,240,1) 0%, transparent 65%)",
        }}
      ></div>

      {/* Decorative vertical lines - hidden on mobile */}
      <div className="absolute left-[10%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-300/50 to-transparent hidden sm:block"></div>
      <div className="absolute right-[10%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-300/50 to-transparent hidden sm:block"></div>

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
        {/* Editorial label */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8 sm:mb-12">
          <div className="w-8 sm:w-16 h-px bg-slate-300"></div>
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
            AI Chatbot · Tri thức Việt Nam
          </span>
          <div className="w-8 sm:w-16 h-px bg-slate-300"></div>
        </div>

        {/* Main title - Serif editorial */}
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-slate-900 mb-6 sm:mb-8 leading-[1.1] sm:leading-[1.05] tracking-tight">
          Hỏi AI về
          <br />
          <span className="italic font-normal text-slate-600">
            Danh nhân Việt Nam
          </span>
        </h1>

        {/* Decorative line */}
        <div className="w-16 sm:w-24 h-px bg-slate-300 mx-auto mb-6 sm:mb-10"></div>

        {/* Subtitle - Light editorial */}
        <p className="text-base sm:text-lg md:text-xl text-slate-500 mb-10 sm:mb-16 max-w-2xl mx-auto font-light leading-relaxed px-2">
          Khám phá hành trình tri thức qua những cuộc đối thoại với AI.
          <br className="hidden sm:block" />
          Từ anh hùng dân tộc đến các nhà văn hóa kiệt xuất.
        </p>

        {/* CTA - Minimal editorial style */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8">
          <Link
            href="/chat"
            className="group relative px-8 sm:px-10 py-4 sm:py-5 bg-slate-900 text-white overflow-hidden rounded-xl w-full sm:w-auto text-center"
          >
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-slate-700 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-xl"></div>
            <span className="relative flex items-center justify-center gap-3 text-sm font-medium tracking-wide">
              Bắt đầu trò chuyện
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
            </span>
          </Link>

          <Link
            href="#categories"
            className="group flex items-center gap-3 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors duration-300"
          >
            <span>Khám phá danh mục</span>
            <svg
              className="w-4 h-4 transform group-hover:translate-y-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Bottom decorative element - hidden on small mobile */}
      <div className="absolute bottom-8 sm:bottom-16 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-4">
        <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">
          Cuộn xuống
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-slate-300 to-transparent"></div>
      </div>
    </section>
  );
}

// ==================== INTRO SECTION ====================
function IntroSection() {
  return (
    <section className="relative py-16 sm:py-32 px-4 sm:px-6 overflow-hidden">
      {/* Base: off-white with subtle warmth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #FAFAF9 0%, #FDFCFB 50%, #FAF9F7 100%)",
        }}
      ></div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #64748b 1px, transparent 1px),
            linear-gradient(to bottom, #64748b 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      ></div>

      {/* Soft radial glow - off-center left */}
      <div
        className="absolute top-1/4 -left-64 w-[500px] h-[500px] opacity-[0.05]"
        style={{
          background:
            "radial-gradient(circle, rgba(203,213,225,1) 0%, transparent 60%)",
        }}
      ></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-24 items-center">
          {/* Left: Glass visual block */}
          <div className="flex justify-center">
            <div className="relative w-56 h-64 sm:w-72 sm:h-80 md:w-80 md:h-96">
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-2xl"></div>

              {/* Pattern overlay */}
              <div
                className="absolute inset-0 opacity-[0.03] rounded-2xl"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              ></div>

              {/* Glass frame */}
              <div className="absolute inset-4 bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-xl"></div>

              {/* Content */}
              <div className="absolute inset-3 sm:inset-4 flex flex-col justify-between p-4 sm:p-6 rounded-xl">
                <div className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-white/10">
                  AI
                </div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2">
                    Công nghệ
                  </p>
                  <p className="text-xl font-serif text-white/90">
                    Retrieval
                    <br />
                    Augmented
                    <br />
                    Generation
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Text content */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-px bg-slate-300"></div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-[0.2em]">
                Về WikiChatbot
              </p>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-6 leading-tight">
              AI như người kể chuyện
              <br />
              <span className="font-normal italic text-slate-600">lịch sử</span>
            </h2>

            <p className="text-lg text-slate-500 mb-6 font-light leading-relaxed">
              WikiChatbot sử dụng công nghệ RAG (Retrieval-Augmented Generation)
              để cung cấp thông tin chính xác, đáng tin cậy về các danh nhân
              Việt Nam.
            </p>

            <p className="text-base text-slate-400 mb-10 leading-relaxed">
              Không chỉ đơn thuần tra cứu, AI sẽ dẫn dắt bạn qua những câu
              chuyện lịch sử, giúp bạn hiểu sâu hơn về di sản trí tuệ của dân
              tộc.
            </p>

            <div className="flex items-center gap-5 sm:gap-8 justify-center lg:justify-start">
              <div>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                  6+
                </p>
                <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">
                  Lĩnh vực
                </p>
              </div>
              <div className="w-px h-10 sm:h-12 bg-slate-200"></div>
              <div>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                  100+
                </p>
                <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">
                  Danh nhân
                </p>
              </div>
              <div className="w-px h-10 sm:h-12 bg-slate-200"></div>
              <div>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                  24/7
                </p>
                <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">
                  Hoạt động
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== CATEGORY BLOCK ====================
interface CategoryItem {
  id: number;
  category: string;
  representative: string;
  years: string;
  description: string;
  tagline: string;
}

function CategoryBlock({ item, index }: { item: CategoryItem; index: number }) {
  const isReversed = index % 2 === 1;

  const getChatUrl = () => {
    return `/chat?context=${encodeURIComponent(item.category)}&prompt=${encodeURIComponent(`Hãy cho tôi biết về ${item.representative}`)}`;
  };

  return (
    <div
      className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 lg:gap-20`}
    >
      {/* Visual Block - Glass/Translucent editorial style */}
      <div className="w-full lg:w-1/2 flex justify-center">
        <div className="relative w-64 h-80 sm:w-80 sm:h-96 md:w-[360px] md:h-[420px] group">
          {/* Background gradient layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 opacity-90 rounded-2xl"></div>

          {/* Subtle pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] rounded-2xl"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>

          {/* Glass card overlay */}
          <div className="absolute inset-6 bg-white/[0.08] backdrop-blur-sm border border-white/10 rounded-xl"></div>

          {/* Content inside glass */}
          <div className="absolute inset-6 flex flex-col justify-between p-8 rounded-xl">
            {/* Top: Index number */}
            <div className="flex justify-between items-start">
              <span className="text-5xl sm:text-7xl md:text-8xl font-serif font-bold text-white/10 leading-none">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="w-8 h-px bg-white/30 mt-6"></div>
            </div>

            {/* Bottom: Category info */}
            <div>
              <p className="text-xs text-white/40 uppercase tracking-[0.25em] mb-3">
                {item.category}
              </p>
              <p className="text-xl sm:text-2xl md:text-3xl font-serif font-medium text-white/90 leading-tight">
                {item.representative}
              </p>
            </div>
          </div>

          {/* Hover accent line */}
          <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </div>

      {/* Text Block */}
      <div
        className={`w-full lg:w-1/2 ${isReversed ? "lg:text-right" : "lg:text-left"} text-center`}
      >
        {/* Category label with line */}
        <div
          className={`flex items-center gap-4 mb-6 ${isReversed ? "lg:flex-row-reverse lg:justify-start justify-center" : "lg:justify-start justify-center"}`}
        >
          <div className="w-12 h-px bg-slate-300"></div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-[0.2em]">
            {item.category}
          </p>
        </div>

        {/* Representative name - Large editorial typography */}
        <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 mb-4 leading-[1.05] tracking-tight">
          {item.representative}
        </h3>

        {/* Years */}
        <p className="text-sm font-mono text-slate-400 mb-5 tracking-wider">
          {item.years}
        </p>

        {/* Description */}
        <p className="text-base sm:text-xl text-slate-600 mb-3 font-light leading-relaxed">
          {item.description}
        </p>

        {/* Tagline */}
        <p className="text-base text-slate-400 mb-10">{item.tagline}</p>

        {/* CTA Button - Minimal style */}
        <Link
          href={getChatUrl()}
          className={`inline-flex items-center gap-3 text-sm font-medium text-slate-900 hover:text-slate-600 transition-colors duration-300 group/btn ${isReversed ? "lg:ml-auto" : ""}`}
        >
          <span className="border-b border-slate-900 group-hover/btn:border-slate-600 pb-1">
            Trò chuyện với AI
          </span>
          <svg
            className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform"
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
      </div>
    </div>
  );
}

// ==================== CATEGORIES SECTION ====================
function CategoriesSection() {
  return (
    <section
      id="categories"
      className="relative py-16 sm:py-32 lg:py-40 px-4 sm:px-6 overflow-hidden"
    >
      {/* Base gradient: ivory transitioning to cool gray */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #FAF9F7 0%, #F8FAFC 30%, #F1F5F9 70%, #E2E8F0 100%)",
        }}
      ></div>

      {/* Editorial grid pattern - 4% opacity */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #475569 1px, transparent 1px),
            linear-gradient(to bottom, #475569 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      ></div>

      {/* Glass editorial overlay - very subtle */}
      <div className="absolute inset-0 bg-slate-600/[0.02] backdrop-blur-[0.3px]"></div>

      {/* Soft vignette - top right */}
      <div
        className="absolute -top-48 -right-48 w-[700px] h-[700px] opacity-[0.07]"
        style={{
          background:
            "radial-gradient(circle, rgba(241,245,249,1) 0%, transparent 60%)",
        }}
      ></div>

      {/* Soft vignette - bottom left */}
      <div
        className="absolute -bottom-32 -left-32 w-[600px] h-[600px] opacity-[0.05]"
        style={{
          background:
            "radial-gradient(circle, rgba(226,232,240,1) 0%, transparent 65%)",
        }}
      ></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header - Editorial style */}
        <div className="text-center mb-16 sm:mb-32">
          <div className="flex items-center justify-center gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="w-10 sm:w-20 h-px bg-slate-200"></div>
            <p className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
              Khám phá
            </p>
            <div className="w-10 sm:w-20 h-px bg-slate-200"></div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 mb-6 sm:mb-8 tracking-tight leading-[1.1]">
            Chọn lĩnh vực
            <br className="hidden sm:block" /> bạn quan tâm
          </h2>
          <p className="text-base sm:text-lg text-slate-500 max-w-xl mx-auto font-light leading-relaxed px-2">
            Mỗi danh nhân là một chương sử. Hãy để AI dẫn dắt bạn qua hành trình
            khám phá những di sản trí tuệ của dân tộc.
          </p>
        </div>

        {/* Editorial Blocks */}
        <div className="space-y-16 sm:space-y-28 lg:space-y-36">
          {CATEGORIES.map((item, index) => (
            <CategoryBlock key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== CTA SECTION ====================
function CTASection() {
  return (
    <section className="relative py-16 sm:py-32 px-4 sm:px-6 overflow-hidden">
      {/* Base gradient: deep slate */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, #1e293b 0%, #0f172a 40%, #020617 100%)",
        }}
      ></div>

      {/* Grid pattern - subtle */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #475569 1px, transparent 1px),
            linear-gradient(to bottom, #475569 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      ></div>

      {/* Soft light vignette - top left */}
      <div
        className="absolute -top-32 -left-32 w-[500px] h-[500px] opacity-[0.08]"
        style={{
          background:
            "radial-gradient(circle, rgba(71,85,105,1) 0%, transparent 60%)",
        }}
      ></div>

      {/* Soft light vignette - bottom right */}
      <div
        className="absolute -bottom-48 -right-48 w-[600px] h-[600px] opacity-[0.06]"
        style={{
          background:
            "radial-gradient(circle, rgba(51,65,85,1) 0%, transparent 65%)",
        }}
      ></div>

      {/* Vertical decorative lines - hidden on mobile */}
      <div className="absolute left-1/4 top-0 bottom-0 w-px bg-white/[0.04] hidden sm:block"></div>
      <div className="absolute right-1/4 top-0 bottom-0 w-px bg-white/[0.04] hidden sm:block"></div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Editorial label */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8 sm:mb-10">
          <div className="w-8 sm:w-16 h-px bg-white/20"></div>
          <span className="text-[10px] sm:text-[11px] font-medium text-white/40 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
            Bắt đầu ngay
          </span>
          <div className="w-8 sm:w-16 h-px bg-white/20"></div>
        </div>

        {/* Title */}
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8 leading-[1.1] tracking-tight">
          Sẵn sàng khám phá
          <br />
          <span className="italic font-normal text-white/60">
            di sản tri thức?
          </span>
        </h2>

        {/* Description */}
        <p className="text-base sm:text-lg text-white/50 mb-10 sm:mb-14 max-w-xl mx-auto font-light leading-relaxed px-2">
          Tạo tài khoản miễn phí để lưu lại lịch sử trò chuyện và tiếp tục hành
          trình khám phá bất cứ lúc nào.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            href="/register"
            className="group relative px-8 sm:px-10 py-4 sm:py-5 bg-white text-slate-900 overflow-hidden rounded-xl w-full sm:w-auto text-center"
          >
            <div className="absolute inset-0 bg-stone-100 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-xl"></div>
            <span className="relative flex items-center justify-center gap-3 text-sm font-medium tracking-wide">
              Đăng ký miễn phí
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
            </span>
          </Link>

          <Link
            href="/chat"
            className="group flex items-center gap-3 text-sm font-medium text-white/60 hover:text-white transition-colors duration-300"
          >
            <span>Dùng thử không cần đăng ký</span>
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
          </Link>
        </div>
      </div>
    </section>
  );
}

// ==================== FOOTER ====================
function Footer() {
  return (
    <footer className="relative py-10 sm:py-16 px-4 sm:px-6 border-t border-slate-200/50 overflow-hidden">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)",
        }}
      ></div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #64748b 1px, transparent 1px),
            linear-gradient(to bottom, #64748b 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      ></div>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-10">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-8 h-8 border border-slate-300 rounded-lg"></div>
              <div className="absolute inset-1.5 bg-slate-800 rounded-md"></div>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-serif font-bold text-white">
                W
              </span>
            </div>
            <div>
              <span className="text-sm font-serif font-semibold text-slate-800">
                WikiChatbot
              </span>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.15em]">
                Danh nhân Việt Nam
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 sm:gap-10 text-sm">
            <Link
              href="/chat"
              className="text-slate-500 hover:text-slate-900 transition-colors duration-300"
            >
              Trò chuyện
            </Link>
            <Link
              href="/login"
              className="text-slate-500 hover:text-slate-900 transition-colors duration-300"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="text-slate-500 hover:text-slate-900 transition-colors duration-300"
            >
              Đăng ký
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-center lg:text-right">
            <p className="text-xs text-slate-400">
              © 2025 WikiChatbot · SEP490 Team
            </p>
            <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-wider">
              Nền tảng tri thức Việt Nam
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ==================== MAIN LANDING PAGE ====================
export default function LandingPage() {
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(180deg, #FDFCFB 0%, #FAF9F7 50%, #F1F5F9 100%)",
      }}
    >
      <Header />
      <main>
        <HeroSection />
        <IntroSection />
        <CategoriesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
