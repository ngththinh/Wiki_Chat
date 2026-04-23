// Storage keys
export const STORAGE_KEYS = {
  GUEST_MESSAGES: "guestChatMessages",
  AUTH_TOKEN: "authToken",
  USER: "user",
} as const;

// Validation constants
export const VALIDATION = {
  EMAIL_REGEX: /\S+@\S+\.\S+/,
  MIN_PASSWORD_LENGTH: 6,
} as const;

// Model types
export const MODELS = {
  RAG: "RAG",
  GRAPH_RAG: "GraphRAG",
} as const;

// Subdomains
export const SUBDOMAINS = {
  RAG: "rag",
  GRAPH_RAG: "graphrag",
} as const;

// Routes
export const ROUTES = {
  HOME: "/",
  CHAT: "/chat",
  LOGIN: "/login",
  REGISTER: "/register",
  LOGOUT: "/logout",
  ABOUT: "/about",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  FORGOT_PASSWORD: "/forgot-password",
  CHANGE_PASSWORD: "/change-password",
  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_SESSIONS: "/admin/sessions",
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_DETAILS: "/admin/details",
  ADMIN_DOCUMENTS: "/admin/categories",
} as const;

// User roles
export const USER_ROLES = {
  GUEST: "guest",
  USER: "user",
  ADMIN: "admin",
} as const;

// Messages
export const MESSAGES = {
  ERROR: {
    EMAIL_REQUIRED: "Vui lòng nhập email",
    EMAIL_INVALID: "Email không hợp lệ",
    PASSWORD_REQUIRED: "Vui lòng nhập mật khẩu",
    PASSWORD_MIN_LENGTH: "Mật khẩu phải có ít nhất 6 ký tự",
    PASSWORD_CONFIRM_REQUIRED: "Vui lòng xác nhận mật khẩu",
    PASSWORD_NOT_MATCH: "Mật khẩu không khớp",
    TERMS_REQUIRED: "Bạn phải chấp nhận Điều khoản sử dụng",
    LOGIN_FAILED: "Đăng nhập thất bại. Vui lòng thử lại.",
    REGISTER_FAILED: "Đăng ký thất bại. Vui lòng thử lại.",
    GENERIC_ERROR: "Đã xảy ra lỗi. Vui lòng thử lại.",
  },
  LOADING: {
    LOGIN: "Đang đăng nhập...",
    REGISTER: "Đang tạo tài khoản...",
  },
} as const;

// Suggestion cards for chat
export const SUGGESTION_CARDS = [
  {
    icon: "💡",
    text: "Hồ Chí Minh là ai?",
  },
  {
    icon: "🚀",
    text: "Võ Nguyên Giáp có vai trò gì trong chiến tranh giải phóng Việt Nam?",
  },
  {
    icon: "📈",
    text: "Nguyễn Trãi có đóng góp gì trong lịch sử Việt Nam?",
  },
  {
    icon: "💼",
    text: "Quang Trung - Nguyễn Huệ đã có vai trò gì trong lịch sử Việt Nam?",
  },
] as const;

// Timing
export const TIMING = {
  AI_RESPONSE_DELAY: 1500,
} as const;
