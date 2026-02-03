import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const userId = 1; // demo

  const [rows]: any = await db.query(
    'SELECT phone, address, latitude, longitude FROM users WHERE id = ?',
    [userId]
  );

  return NextResponse.json(rows[0] || {});
}
