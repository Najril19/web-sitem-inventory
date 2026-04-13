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
