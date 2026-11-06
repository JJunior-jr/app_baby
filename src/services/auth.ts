import { UserProfile } from '../types';

const TOKEN_STORAGE_KEY = 'baby_john_jwt_token';
const USER_STORAGE_KEY = 'baby_john_user';

// Helper to base64url encode strings
function base64UrlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Helper to base64url decode strings
function base64UrlDecode(str: string): string {
  let output = str.replace(/-/g, '+').replace(/_/g, '/');
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += '==';
      break;
    case 3:
      output += '=';
      break;
    default:
      throw new Error('Illegal base64url string!');
  }
  return decodeURIComponent(escape(atob(output)));
}

// Generate a realistic JWT token with Header, Payload, and Signature
export function generateMockJwt(user: Partial<UserProfile>): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const nowSeconds = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.id || 'usr_1092837',
    name: user.name || 'Papai',
    email: user.email || 'jacsonsajr.study@gmail.com',
    babyName: user.babyName || 'John',
    role: user.role || 'parent',
    iat: nowSeconds,
    exp: nowSeconds + 60 * 60 * 24 * 7, // 7 days expiration
    iss: 'fastapi-backend-baby-john',
    aud: 'baby-john-client',
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  // Simulated HMAC-SHA256 signature representation
  const signature = base64UrlEncode(`sig_${user.id}_${nowSeconds}_verified`);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function parseJwt(token: string): { header: Record<string, unknown>; payload: Record<string, unknown> } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return { header, payload };
  } catch (err) {
    console.error('Failed to parse JWT', err);
    return null;
  }
}

export const authService = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem('roti_hub_jwt_token');
    } catch {
      return null;
    }
  },

  getCurrentUser(): UserProfile | null {
    const defaultUser: UserProfile = {
      id: 'usr_849201',
      name: 'Papai',
      email: 'jacsonsajr.study@gmail.com',
      role: 'admin_parent',
      babyName: 'John',
      babyBirthDate: '2026-04-10',
    };
    const token = generateMockJwt(defaultUser);
    defaultUser.token = token;

    try {
      const userJson = localStorage.getItem(USER_STORAGE_KEY) || localStorage.getItem('roti_hub_user');
      if (!userJson) {
        try {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultUser));
          localStorage.setItem(TOKEN_STORAGE_KEY, token);
        } catch {}
        return defaultUser;
      }
      return JSON.parse(userJson);
    } catch {
      return defaultUser;
    }
  },

  login(email: string, _password?: string): { user: UserProfile; token: string } {
    const user: UserProfile = {
      id: `usr_${Date.now().toString(36)}`,
      name: email.includes('@') ? email.split('@')[0] : 'Papai',
      email,
      role: 'admin_parent',
      babyName: 'John',
      babyBirthDate: '2026-04-10',
    };
    const token = generateMockJwt(user);
    user.token = token;

    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {}
    return { user, token };
  },

  register(name: string, email: string, babyName: string): { user: UserProfile; token: string } {
    const user: UserProfile = {
      id: `usr_${Date.now().toString(36)}`,
      name: name || 'Papai',
      email,
      role: 'admin_parent',
      babyName: babyName || 'John',
      babyBirthDate: '2026-04-10',
    };
    const token = generateMockJwt(user);
    user.token = token;

    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {}
    return { user, token };
  },

  logout(): void {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {}
  },

  getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
    };
  },
};
