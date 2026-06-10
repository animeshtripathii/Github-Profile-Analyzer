



CREATE DATABASE IF NOT EXISTS github_analyzer
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE github_analyzer;




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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
