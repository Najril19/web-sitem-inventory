import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { authenticate } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = authenticate(authHeader);

    if (!user) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }

    const db = getDatabase();
    const userProfile = db.prepare('SELECT id, username, full_name, role, created_at FROM users WHERE id = ?').get(user.id);

    return NextResponse.json({
      success: true,
      user: userProfile,
    });
  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
