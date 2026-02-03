import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT || 4000),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,

  // ✅ สำคัญ: บังคับ TLS แบบที่ mysql2 เข้าใจแน่นอน
  ssl: 'Amazon RDS',

  waitForConnections: true,
  connectionLimit: 5,
});
