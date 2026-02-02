// API Configuration
// Port 3000 is for frontend Next.js dev server
// Backend API URL (production hoặc localhost:8000)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://sep490-8-wikichatbot-backends.onrender.com/api';

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

// Auth Service
export const authService = {
  // Login với username và password
  async login(username: string, password: string): Promise<ApiResponse<LoginResponseDto>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usernameOrEmail: username, password } as LoginDto),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.detail || 'Đăng nhập thất bại',
        };
      }

      // Save token và user info to localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
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
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
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
      const token = localStorage.getItem('authToken');
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
      localStorage.setItem('user', JSON.stringify(data));

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
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  // Get auth token
  getToken() {
    return localStorage.getItem('authToken');
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
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));

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
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));

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
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getCurrentUser(): UserDto | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  getToken() {
    return localStorage.getItem('authToken');
  },
};

// Export the service to use (switch between real and mock)
// Sử dụng authService cho production với backend thực
// Sử dụng mockAuthService cho development/testing
export default authService;
