// API Configuration
// Port 3000 is for frontend Next.js dev server
// Backend API URL - uses Next.js rewrites proxy to avoid CORS
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// User DTO from backend
export interface UserDto {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
}

// Login request/response matching backend API
export interface LoginDto {
  usernameOrEmail: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  user: UserDto;
}

// Register request matching backend API
export interface RegisterDto {
  username: string;
  password: string;
  email: string;
  fullName?: string;
}

// Update profile request
export interface UpdateProfileDto {
  fullName?: string;
  avatarUrl?: string;
}

// Legacy interfaces for backwards compatibility
export interface LoginResponse extends LoginResponseDto {}
export interface RegisterResponse extends LoginResponseDto {}

const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "user";
const AUTH_TOKEN_ISSUED_AT_KEY = "authTokenIssuedAt";
const TOKEN_SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 60 minutes

const persistAuthSession = (token: string, user: UserDto) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.setItem(AUTH_TOKEN_ISSUED_AT_KEY, Date.now().toString());
};

const clearAuthSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_TOKEN_ISSUED_AT_KEY);
};

const getStoredToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

const hasTokenExpired = () => {
  const token = getStoredToken();
  if (!token) return false;

  const issuedAtRaw = localStorage.getItem(AUTH_TOKEN_ISSUED_AT_KEY);
  if (!issuedAtRaw) {
    // Backward compatibility for old sessions created before timeout support.
    localStorage.setItem(AUTH_TOKEN_ISSUED_AT_KEY, Date.now().toString());
    return false;
  }

  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt)) {
    clearAuthSession();
    return true;
  }

  if (Date.now() - issuedAt >= TOKEN_SESSION_TIMEOUT_MS) {
    clearAuthSession();
    return true;
  }

  return false;
};

export const getValidAuthToken = (): string | null => {
  const token = getStoredToken();
  if (!token) return null;
  if (hasTokenExpired()) return null;
  return token;
};

// Auth Service
export const authService = {
  // Login với username và password
  async login(username: string, password: string): Promise<ApiResponse<LoginResponseDto>> {
    try {
      console.log("🔐 Login attempt with:", { usernameOrEmail: username, password: "***" });
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usernameOrEmail: username, password } as LoginDto),
      });

      const data = await response.json();
      console.log("🔐 Login response status:", response.status);
      console.log("🔐 Login response data:", data);

      if (!response.ok) {
        console.error("❌ Login failed:", data);
        return {
          success: false,
          error: data.message || data.detail || 'Đăng nhập thất bại',
        };
      }

      // Save token và user info to localStorage
      if (data.token) {
        console.log("✅ Login success, user role:", data.user?.role);
        persistAuthSession(data.token, data.user);
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("❌ Login error:", error);
      return {
        success: false,
        error: 'Lỗi kết nối. Vui lòng kiểm tra mạng.',
      };
    }
  },

  // Register với đầy đủ thông tin
  async register(registerData: RegisterDto): Promise<ApiResponse<LoginResponseDto>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.detail || 'Đăng ký thất bại',
        };
      }

      // Save token và user info to localStorage
      if (data.token) {
        persistAuthSession(data.token, data.user);
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Lỗi kết nối. Vui lòng kiểm tra mạng.',
      };
    }
  },

  // Update user profile
  async updateProfile(profileData: UpdateProfileDto): Promise<ApiResponse<UserDto>> {
    try {
      const token = getValidAuthToken();
      if (!token) {
        return {
          success: false,
          error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        };
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.detail || 'Cập nhật thất bại',
        };
      }

      // Update user in localStorage
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data));

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Lỗi kết nối. Vui lòng kiểm tra mạng.',
      };
    }
  },

  // Logout
  logout() {
    clearAuthSession();
  },

  // Get current user
  getCurrentUser() {
    if (!getValidAuthToken()) return null;

    const userStr = localStorage.getItem(AUTH_USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      // Keep authToken intact; only remove corrupted user payload.
      localStorage.removeItem(AUTH_USER_KEY);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!getValidAuthToken();
  },

  // Get auth token
  getToken() {
    return getValidAuthToken();
  },
};

// Mock Auth Service (for testing without backend)
export const mockAuthService = {
  // Mock users database - updated to match backend UserDto structure
  users: [
    { id: 1, username: 'test', email: 'test@example.com', password: 'password123', fullName: 'Test User', avatarUrl: null as string | null, role: 'user' },
    { id: 2, username: 'demo', email: 'demo@example.com', password: 'demo123', fullName: 'Demo User', avatarUrl: null as string | null, role: 'user' },
    { id: 3, username: 'admin', email: 'admin@wikichatbot.vn', password: 'admin123', fullName: 'Admin User', avatarUrl: null as string | null, role: 'admin' },
  ] as Array<{ id: number; username: string; email: string; password: string; fullName: string | null; avatarUrl: string | null; role: string }>,

  async login(username: string, password: string): Promise<ApiResponse<LoginResponseDto>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = this.users.find(u => u.username === username && u.password === password);

    if (!user) {
      return {
        success: false,
        error: 'Tên đăng nhập hoặc mật khẩu không đúng',
      };
    }

    const token = `mock-token-${user.id}-${Date.now()}`;
    const userData: UserDto = { 
      id: user.id, 
      username: user.username,
      email: user.email, 
      fullName: user.fullName, 
      avatarUrl: user.avatarUrl,
      role: user.role 
    };

    // Save to localStorage
    persistAuthSession(token, userData);

    return {
      success: true,
      data: {
        token,
        user: userData,
      },
    };
  },

  async register(registerData: RegisterDto): Promise<ApiResponse<LoginResponseDto>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if username already exists
    const existingUser = this.users.find(u => u.username === registerData.username);
    if (existingUser) {
      return {
        success: false,
        error: 'Tên đăng nhập đã tồn tại',
      };
    }

    // Check if email already exists
    const existingEmail = this.users.find(u => u.email === registerData.email);
    if (existingEmail) {
      return {
        success: false,
        error: 'Email đã được sử dụng',
      };
    }

    // Create new user
    const newUser = {
      id: this.users.length + 1,
      username: registerData.username,
      email: registerData.email,
      password: registerData.password,
      fullName: registerData.fullName || null,
      avatarUrl: null,
      role: 'user',
    };

    this.users.push(newUser);

    const token = `mock-token-${newUser.id}-${Date.now()}`;
    const userData: UserDto = { 
      id: newUser.id, 
      username: newUser.username,
      email: newUser.email, 
      fullName: newUser.fullName, 
      avatarUrl: newUser.avatarUrl,
      role: newUser.role 
    };

    // Save to localStorage
    persistAuthSession(token, userData);

    return {
      success: true,
      data: {
        token,
        user: userData,
      },
    };
  },

  async updateProfile(profileData: UpdateProfileDto): Promise<ApiResponse<UserDto>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return {
        success: false,
        error: 'Chưa đăng nhập',
      };
    }

    const currentUser = JSON.parse(userStr);
    const updatedUser: UserDto = {
      ...currentUser,
      ...profileData,
    };

    localStorage.setItem('user', JSON.stringify(updatedUser));

    return {
      success: true,
      data: updatedUser,
    };
  },

  logout() {
    clearAuthSession();
  },

  getCurrentUser(): UserDto | null {
    if (!getValidAuthToken()) return null;

    const userStr = localStorage.getItem(AUTH_USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      localStorage.removeItem(AUTH_USER_KEY);
      return null;
    }
  },

  isAuthenticated() {
    return !!getValidAuthToken();
  },

  getToken() {
    return getValidAuthToken();
  },
};

// Export the service to use (switch between real and mock)
// Sử dụng authService cho production với backend thực
// Sử dụng mockAuthService cho development/testing
export default authService;
