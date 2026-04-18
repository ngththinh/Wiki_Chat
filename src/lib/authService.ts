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

// Forgot Password request/response matching backend API
export interface ForgotPasswordDto {
  email: string;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
}

export interface VerifyOtpResponseDto {
  resetToken: string;
  message: string;
}

export interface SetNewPasswordDto {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
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

// Helper function to safely parse JSON response
const safeParseJson = async (response: Response) => {
  try {
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('⚠️ Response is not JSON:', contentType);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('❌ JSON parse error:', error);
    return null;
  }
};

const mapLoginErrorMessage = (errorMessage?: string | null): string => {
  const rawMessage = (errorMessage || '').trim();
  if (!rawMessage) return 'Đăng nhập thất bại. Vui lòng thử lại.';

  const message = rawMessage.toLowerCase();

  if (message.includes('transient failure')) {
    return 'Hệ thống đang tạm thời gián đoạn. Vui lòng thử lại sau ít phút.';
  }

  if (
    message.includes('invalid username') ||
    message.includes('invalid password') ||
    message.includes('invalid credentials') ||
    message.includes('wrong password')
  ) {
    return 'Tên đăng nhập hoặc mật khẩu không đúng.';
  }

  if (message.includes('unauthorized') || message.includes('forbidden')) {
    return 'Bạn không có quyền truy cập. Vui lòng kiểm tra lại tài khoản.';
  }

  if (message.includes('locked') || message.includes('lockout')) {
    return 'Tài khoản đang tạm khóa. Vui lòng thử lại sau.';
  }

  if (message.includes('timeout')) {
    return 'Yêu cầu đăng nhập quá thời gian. Vui lòng thử lại.';
  }

  if (message.includes('http 400')) {
    return 'Dữ liệu đăng nhập không hợp lệ (HTTP 400).';
  }

  if (message.includes('http 401')) {
    return 'Tên đăng nhập hoặc mật khẩu không đúng (HTTP 401).';
  }

  if (message.includes('http 403')) {
    return 'Bạn không có quyền truy cập (HTTP 403).';
  }

  if (message.includes('http 500')) {
    return 'Máy chủ đang gặp lỗi. Vui lòng thử lại sau.';
  }

  return 'Đăng nhập thất bại. Vui lòng thử lại.';
};

const mapChangePasswordErrorMessage = (errorMessage?: string | null): string => {
  const rawMessage = (errorMessage || '').trim();
  if (!rawMessage) {
    return 'Không thể đổi mật khẩu. Vui lòng thử lại.';
  }

  const message = rawMessage.toLowerCase();

  if (message.includes('old password') && message.includes('incorrect')) {
    return 'Mật khẩu hiện tại không đúng.';
  }

  if (message.includes('password') && message.includes('mismatch')) {
    return 'Mật khẩu xác nhận không khớp.';
  }

  if (message.includes('same as old') || message.includes('must be different')) {
    return 'Mật khẩu mới phải khác mật khẩu hiện tại.';
  }

  if (message.includes('transient failure')) {
    return 'Hệ thống đang tạm thời gián đoạn. Vui lòng thử lại sau ít phút.';
  }

  if (message.includes('unauthorized') || message.includes('forbidden')) {
    return 'Phiên đăng nhập không hợp lệ hoặc bạn không có quyền thực hiện.';
  }

  if (message.includes('http 400')) {
    return 'Dữ liệu đổi mật khẩu không hợp lệ (HTTP 400).';
  }

  if (message.includes('http 401')) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }

  if (message.includes('http 500')) {
    return 'Máy chủ đang gặp lỗi. Vui lòng thử lại sau.';
  }

  return 'Đổi mật khẩu thất bại. Vui lòng thử lại.';
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

      const data = await safeParseJson(response);
      console.log("🔐 Login response status:", response.status);
      console.log("🔐 Login response data:", data);

      if (!response.ok) {
        console.error("❌ Login failed:", data);
        return {
          success: false,
          error: mapLoginErrorMessage(
            data?.message || data?.detail || `Đăng nhập thất bại (HTTP ${response.status})`,
          ),
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

      const data = await safeParseJson(response);

      if (!response.ok) {
        return {
          success: false,
          error: data?.message || data?.detail || 'Đăng ký thất bại',
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

      const data = await safeParseJson(response);

      if (!response.ok) {
        return {
          success: false,
          error: data?.message || data?.detail || 'Cập nhật thất bại',
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

  // Forgot Password - Step 1: Request OTP
  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email } as ForgotPasswordDto),
      });

      const data = await safeParseJson(response);

      if (!response.ok) {
        return {
          success: false,
          error: data?.message || data?.detail || 'Không thể gửi OTP. Vui lòng thử lại.',
        };
      }

      return {
        success: true,
        data: data || { message: 'OTP đã được gửi' },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Lỗi kết nối. Vui lòng kiểm tra mạng.',
      };
    }
  },

  // Verify OTP - Step 2: Verify OTP and get reset token
  async verifyOtp(email: string, otp: string): Promise<ApiResponse<VerifyOtpResponseDto>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp } as VerifyOtpDto),
      });

      const data = await safeParseJson(response);

      if (!response.ok) {
        return {
          success: false,
          error: data?.message || data?.detail || 'OTP không hợp lệ. Vui lòng thử lại.',
        };
      }

      return {
        success: true,
        data: data as VerifyOtpResponseDto,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Lỗi kết nối. Vui lòng kiểm tra mạng.',
      };
    }
  },

  // Set New Password - Step 3: Reset password with reset token
  async setNewPassword(resetToken: string, newPassword: string, confirmPassword: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/set-new-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resetToken, newPassword, confirmPassword } as SetNewPasswordDto),
      });

      const data = await safeParseJson(response);

      if (!response.ok) {
        return {
          success: false,
          error: data?.message || data?.detail || 'Không thể cập nhật mật khẩu. Vui lòng thử lại.',
        };
      }

      return {
        success: true,
        data: data || { message: 'Password reset successful' },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Lỗi kết nối. Vui lòng kiểm tra mạng.',
      };
    }
  },

  async changePassword(
    oldPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<ApiResponse<string | Record<string, unknown>>> {
    try {
      const token = getValidAuthToken();
      if (!token) {
        return {
          success: false,
          error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        };
      }

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
          confirmPassword,
        } as ChangePasswordDto),
      });

      const rawText = await response.text();
      let parsedData: unknown = null;
      if (rawText) {
        try {
          parsedData = JSON.parse(rawText);
        } catch {
          parsedData = rawText;
        }
      }

      if (!response.ok) {
        const message =
          typeof parsedData === 'object' && parsedData !== null
            ? ((parsedData as { message?: string; detail?: string }).message ||
              (parsedData as { message?: string; detail?: string }).detail)
            : typeof parsedData === 'string'
              ? parsedData
              : `Đổi mật khẩu thất bại (HTTP ${response.status})`;

        return {
          success: false,
          error: mapChangePasswordErrorMessage(message),
        };
      }

      return {
        success: true,
        data:
          (typeof parsedData === 'string' ||
            (typeof parsedData === 'object' && parsedData !== null))
            ? (parsedData as string | Record<string, unknown>)
            : 'Đổi mật khẩu thành công',
      };
    } catch {
      return {
        success: false,
        error: 'Lỗi kết nối. Vui lòng kiểm tra mạng.',
      };
    }
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
