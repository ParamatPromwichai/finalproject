import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const userId = 1; // demo user
    const { phone, address, location } = await req.json();

    // ✅ บังคับแค่ phone
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
        address || null,
        location?.lat ?? null,
        location?.lng ?? null,
        userId
      ]
    );

    return NextResponse.json({ message: 'บันทึกข้อมูลเรียบร้อย' });

  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ message: 'Failed to update' }, { status: 500 });
  }
}
