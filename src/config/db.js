const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'github_analyzer',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: process.env.DB_HOST && process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : undefined,
});


async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    console.log('✅ MySQL connection pool established successfully.');

    const [rows] = await connection.query(`SHOW TABLES LIKE 'profiles'`);
    if (rows.length === 0) {
      console.log('🔄 Profiles table not found. Initializing database schema...');
      const schemaPath = path.join(__dirname, '..', '..', 'scripts', 'schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');

      const statements = schemaSql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      for (const stmt of statements) {
        await connection.query(stmt);
      }
      console.log('✅ Database schema initialized successfully.');
    } else {
      console.log('📊 Profiles table exists. Schema is up-to-date.');
    }
  } finally {
    connection.release();
  }
}

module.exports = { pool, testConnection };

