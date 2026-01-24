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
  ADMIN: "/admin",
  ADMIN_DOCUMENTS: "/admin/documents",
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
    text: "Phạm Nhật Vượng thành công như thế nào?",
  },
  {
    icon: "🚀",
    text: "Bắt đầu startup công nghệ như thế nào?",
  },
  {
    icon: "📈",
    text: "Chiến lược kinh doanh hiệu quả nhất",
  },
  {
    icon: "💼",
    text: "Bài học từ các danh nhân Việt",
  },
] as const;

// Timing
export const TIMING = {
  AI_RESPONSE_DELAY: 1500,
} as const;
