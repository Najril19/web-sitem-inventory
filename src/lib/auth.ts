import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: number;
  username: string;
  role: string;
}

export function authenticate(authHeader: string | null): AuthUser | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const jwtSecret = process.env.JWT_SECRET || 'default-secret';

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function createToken(user: AuthUser): string {
  const jwtSecret = process.env.JWT_SECRET || 'default-secret';
  return jwt.sign(user, jwtSecret, { expiresIn: '24h' });
}

// Client-side auth storage
const AUTH_EXPIRES_AT_KEY = 'auth_expires_at';
export const AUTH_SESSION_MS = 2 * 60 * 60 * 1000;

function clearAuthKeys() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem(AUTH_EXPIRES_AT_KEY);
  }
}

export const authStorage = {
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem(AUTH_EXPIRES_AT_KEY, String(Date.now() + AUTH_SESSION_MS));
    }
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return null;
    }
    const expRaw = localStorage.getItem(AUTH_EXPIRES_AT_KEY);
    if (!expRaw) {
      localStorage.setItem(AUTH_EXPIRES_AT_KEY, String(Date.now() + AUTH_SESSION_MS));
      return token;
    }
    const exp = Number(expRaw);
    if (Number.isFinite(exp) && Date.now() > exp) {
      clearAuthKeys();
      return null;
    }
    return token;
  },

  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem(AUTH_EXPIRES_AT_KEY);
    }
  },

  setUser: (user: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
  },

  getUser: (): any | null => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('auth_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  removeUser: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_user');
    }
  },

  getSessionRemainingMs: (): number | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    if (!localStorage.getItem('auth_token')) {
      return null;
    }
    const expRaw = localStorage.getItem(AUTH_EXPIRES_AT_KEY);
    if (!expRaw) {
      return AUTH_SESSION_MS;
    }
    const exp = Number(expRaw);
    if (!Number.isFinite(exp)) {
      return null;
    }
    const left = exp - Date.now();
    return left > 0 ? left : null;
  },

  isAuthenticated: (): boolean => {
    return !!authStorage.getToken();
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      clearAuthKeys();
    }
  },
};
