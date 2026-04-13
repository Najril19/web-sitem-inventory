import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Login
router.post('/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password harus diisi' });
    }

    const db = getDatabase();
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;

    if (!user) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'default-secret';
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// Get current user profile
router.get('/profile', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const db = getDatabase();
    const user = db.prepare('SELECT id, username, full_name, role, created_at FROM users WHERE id = ?').get(req.user!.id);

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// Change password
router.post('/change-password', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({ error: 'Password lama dan baru harus diisi' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Password baru minimal 6 karakter' });
    }

    const db = getDatabase();
    const user = db.prepare('SELECT password FROM users WHERE id = ?').get(req.user!.id) as any;

    const isOldPasswordValid = bcrypt.compareSync(old_password, user.password);
    if (!isOldPasswordValid) {
      return res.status(401).json({ error: 'Password lama salah' });
    }

    const hashedNewPassword = bcrypt.hashSync(new_password, 10);
    db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(hashedNewPassword, req.user!.id);

    res.json({
      success: true,
      message: 'Password berhasil diubah',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

export default router;
