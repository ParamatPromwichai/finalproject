import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT || 4000), // ✅ TiDB ใช้ 4000
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  ssl: {
    rejectUnauthorized: true, // ✅ จำเป็นสำหรับ TiDB Cloud
  },
  waitForConnections: true,
  connectionLimit: 5,        // เหมาะกับ Vercel
  queueLimit: 0,
});
