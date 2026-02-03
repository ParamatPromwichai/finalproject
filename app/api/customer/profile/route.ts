import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* =========================
   GET : โหลดข้อมูลโปรไฟล์
========================= */
export async function GET() {
  try {
    const userId = 1; // demo user (เปลี่ยนเป็น session ภายหลังได้)

    const [rows]: any = await db.query(
      'SELECT id, username, phone, address, latitude, longitude FROM users WHERE id = ?',
      [userId]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({}, { status: 200 });
    }

    return NextResponse.json(rows[0], { status: 200 });

  } catch (error) {
    console.error('GET Profile Error:', error);
    return NextResponse.json(
      { message: 'Error loading profile' },
      { status: 500 }
    );
  }
}

/* =========================
   PUT : อัปเดตโปรไฟล์
========================= */
export async function PUT(req: Request) {
  try {
    const userId = 1; // demo user
    const { phone, address, location } = await req.json();

    // ✅ บังคับเฉพาะเบอร์โทร
    if (!phone) {
      return NextResponse.json(
        { message: 'กรุณาระบุเบอร์โทรศัพท์' },
        { status: 400 }
      );
    }

    await db.query(
      `UPDATE users
       SET
         phone = ?,
         address = COALESCE(?, address),
         latitude = COALESCE(?, latitude),
         longitude = COALESCE(?, longitude)
       WHERE id = ?`,
      [
        phone,
        address ?? null,
        location?.lat ?? null,
        location?.lng ?? null,
        userId
      ]
    );

    return NextResponse.json(
      { message: 'บันทึกข้อมูลเรียบร้อย' },
      { status: 200 }
    );

  } catch (error) {
    console.error('PUT Profile Error:', error);
    return NextResponse.json(
      { message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
