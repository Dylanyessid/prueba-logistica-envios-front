import apiClient from '@/lib/apiClient';

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
  };
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface TokenPayload {
  role?: string;
  userId?: number;
  clientId?: number;
}

function decodeToken(token: string): TokenPayload {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return {};
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return {};
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/users/login', credentials);
    return response.data;
  },

  setToken(token: string): void {
    localStorage.setItem('token', token);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    localStorage.setItem('tokenExpiry', expiresAt.toISOString());
    const payload = decodeToken(token);
    if (payload.role) {
      localStorage.setItem('userRole', payload.role);
    }
    if(payload.userId){
      localStorage.setItem('userId', String(payload.userId));
    }
    if(payload.clientId){
      localStorage.setItem('clientId', String(payload.clientId));
    }
  },

  getToken(): string | null {
    const token = localStorage.getItem('token');
    const expiry = localStorage.getItem('tokenExpiry');
    
    if (!token || !expiry) return null;
    
    if (new Date(expiry) <= new Date()) {
      this.logout();
      return null;
    }
    
    return token;
  },

  getRole(): string | null {
    return localStorage.getItem('userRole');
  },

  getClientId(): number | null {
    const clientId = localStorage.getItem('clientId');
    return clientId ? parseInt(clientId, 10) : null;
  },

  hasRole(allowedRoles: string[]): boolean {
    const role = this.getRole();
    return role ? allowedRoles.includes(role) : false;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('userRole');
  },

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },
};

export default authService;