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

    let [rows] = await connection.query(`SHOW TABLES LIKE 'profiles'`);
    if (rows.length > 0) {
      const [cols] = await connection.query(`SHOW COLUMNS FROM profiles LIKE 'github_id'`);
      if (cols.length === 0) {
        console.log('⚠️ Old table schema detected (missing github_id). Dropping old tables to recreate...');
        await connection.query('DROP TABLE IF EXISTS profile_languages');
        await connection.query('DROP TABLE IF EXISTS profiles');
        rows = [];
      }
    }

    if (rows.length === 0) {
      console.log('🔄 Profiles table not found. Initializing database schema...');
      
      const createProfilesTable = `
        CREATE TABLE IF NOT EXISTS profiles (
          id              INT           AUTO_INCREMENT PRIMARY KEY,
          github_id       BIGINT        NOT NULL UNIQUE,
          username        VARCHAR(39)   NOT NULL UNIQUE,
          name            VARCHAR(255)  DEFAULT NULL,
          bio             TEXT          DEFAULT NULL,
          location        VARCHAR(255)  DEFAULT NULL,
          avatar_url      VARCHAR(500)  DEFAULT NULL,
          profile_url     VARCHAR(500)  DEFAULT NULL,
          followers       INT           NOT NULL DEFAULT 0,
          following       INT           NOT NULL DEFAULT 0,
          public_repos    INT           NOT NULL DEFAULT 0,
          total_stars     INT           NOT NULL DEFAULT 0,
          total_forks     INT           NOT NULL DEFAULT 0,
          original_repos  INT           NOT NULL DEFAULT 0,
          forked_repos    INT           NOT NULL DEFAULT 0,
          most_starred_repo VARCHAR(255) DEFAULT NULL,
          follower_to_repo_ratio DECIMAL(10, 2) DEFAULT 0.00,
          account_created_at DATETIME   DEFAULT NULL,
          last_analyzed_at   DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
          created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_username (username),
          INDEX idx_followers (followers),
          INDEX idx_total_stars (total_stars),
          INDEX idx_last_analyzed (last_analyzed_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;

      const createLanguagesTable = `
        CREATE TABLE IF NOT EXISTS profile_languages (
          id          INT           AUTO_INCREMENT PRIMARY KEY,
          profile_id  INT           NOT NULL,
          language    VARCHAR(100)  NOT NULL,
          repo_count  INT           NOT NULL DEFAULT 1,
          UNIQUE KEY uq_profile_language (profile_id, language),
          CONSTRAINT fk_profile_languages_profile
            FOREIGN KEY (profile_id) REFERENCES profiles(id)
            ON DELETE CASCADE
            ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
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

