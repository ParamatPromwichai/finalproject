import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { db } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const [rows]: any = await db.query(
    'SELECT * FROM users WHERE username = ?',
    [username]
  );

  if (rows.length === 0) {
    return NextResponse.json({ message: 'ไม่พบผู้ใช้' }, { status: 401 });
  }

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return NextResponse.json({ message: 'รหัสผ่านผิด' }, { status: 401 });
  }

  const token = signToken({
    id: user.id,
    role: user.role,
  });

  return NextResponse.json({
    token,
    role: user.role,
  });
}
