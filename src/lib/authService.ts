// API Configuration
// Port 3000 is for frontend Next.js dev server
// Port 8000 is default for backend API (when available)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  token: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  token: string;
}

// Auth Service
export const authService = {
  // Login
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Login failed',
        };
      }

      // Save token to localStorage
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
        error: 'Network error. Please check your connection.',
      };
    }
  },

  // Register
  async register(email: string, password: string): Promise<ApiResponse<RegisterResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Registration failed',
        };
      }

      // Save token to localStorage
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
        error: 'Network error. Please check your connection.',
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
  // Mock users database
  users: [
    { id: '1', email: 'test@example.com', password: 'password123', name: 'Test User', role: 'user' as const },
    { id: '2', email: 'demo@example.com', password: 'demo123', name: 'Demo User', role: 'user' as const },
    { id: '3', email: 'admin@wikichatbot.vn', password: 'admin123', name: 'Admin User', role: 'admin' as const },
  ],

  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = this.users.find(u => u.email === email && u.password === password);

    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    const token = `mock-token-${user.id}-${Date.now()}`;
    const userData = { id: user.id, email: user.email, name: user.name, role: user.role };

    // Save to localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));

    return {
      success: true,
      data: {
        user: userData,
        token,
      },
    };
  },

  async register(email: string, password: string): Promise<ApiResponse<RegisterResponse>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if user already exists
    const existingUser = this.users.find(u => u.email === email);
    if (existingUser) {
      return {
        success: false,
        error: 'Email already exists',
      };
    }

    // Create new user
    const newUser = {
      id: `${this.users.length + 1}`,
      email,
      password,
      name: email.split('@')[0],
      role: 'user' as const,
    };

    this.users.push(newUser);

    const token = `mock-token-${newUser.id}-${Date.now()}`;
    const userData = { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role };

    // Save to localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));

    return {
      success: true,
      data: {
        user: userData,
        token,
      },
    };
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
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
// Use mockAuthService for development without backend
export default mockAuthService;
