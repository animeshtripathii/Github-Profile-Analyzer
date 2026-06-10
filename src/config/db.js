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
      
      const createProfilesTable = `
        CREATE TABLE IF NOT EXISTS profiles (
          username VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255),
          avatar_url VARCHAR(500),
          profile_url VARCHAR(500),
          bio TEXT,
          location VARCHAR(255),
          public_repos INT DEFAULT 0,
          followers INT DEFAULT 0,
          following INT DEFAULT 0,
          account_created_at TIMESTAMP NULL,
          total_stars INT DEFAULT 0,
          total_forks INT DEFAULT 0,
          original_repos INT DEFAULT 0,
          forked_repos INT DEFAULT 0,
          follower_to_repo_ratio DECIMAL(10, 2) DEFAULT 0.00,
          top_language VARCHAR(100),
          most_starred_repo VARCHAR(255),
          last_analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `;

      const createLanguagesTable = `
        CREATE TABLE IF NOT EXISTS profile_languages (
          username VARCHAR(255),
          language VARCHAR(100),
          repo_count INT DEFAULT 0,
          PRIMARY KEY (username, language),
          FOREIGN KEY (username) REFERENCES profiles(username) ON DELETE CASCADE
        )
      `;

      await connection.query(createProfilesTable);
      await connection.query(createLanguagesTable);
      console.log('✅ Database schema initialized successfully.');
    } else {
      console.log('📊 Profiles table exists. Schema is up-to-date.');
    }
  } finally {
    connection.release();
  }
}

module.exports = { pool, testConnection };

