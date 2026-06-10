const { pool } = require('../config/db');


const ALLOWED_SORT_COLUMNS = [
  'last_analyzed_at',
  'followers',
  'total_stars',
  'public_repos',
  'username',
];


async function upsertProfile(data) {
  const sql = `
    INSERT INTO profiles (
      github_id, username, name, bio, location, avatar_url, profile_url,
      followers, following, public_repos, total_stars, total_forks,
      original_repos, forked_repos, most_starred_repo,
      follower_to_repo_ratio, account_created_at, last_analyzed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      username = VALUES(username),
      name = VALUES(name),
      bio = VALUES(bio),
      location = VALUES(location),
      avatar_url = VALUES(avatar_url),
      profile_url = VALUES(profile_url),
      followers = VALUES(followers),
      following = VALUES(following),
      public_repos = VALUES(public_repos),
      total_stars = VALUES(total_stars),
      total_forks = VALUES(total_forks),
      original_repos = VALUES(original_repos),
      forked_repos = VALUES(forked_repos),
      most_starred_repo = VALUES(most_starred_repo),
      follower_to_repo_ratio = VALUES(follower_to_repo_ratio),
      account_created_at = VALUES(account_created_at),
      last_analyzed_at = NOW()
  `;

  const params = [
    data.github_id,
    data.username,
    data.name,
    data.bio,
    data.location,
    data.avatar_url,
    data.profile_url,
    data.followers,
    data.following,
    data.public_repos,
    data.total_stars,
    data.total_forks,
    data.original_repos,
    data.forked_repos,
    data.most_starred_repo,
    data.follower_to_repo_ratio,
    data.account_created_at,
  ];

  const [result] = await pool.execute(sql, params);
  return result;
}


async function upsertLanguages(profileId, languages) {
  
  await pool.execute('DELETE FROM profile_languages WHERE profile_id = ?', [
    profileId,
  ]);

  if (!languages || languages.length === 0) return;

  
  const sql = `
    INSERT INTO profile_languages (profile_id, language, repo_count)
    VALUES ${languages.map(() => '(?, ?, ?)').join(', ')}
  `;

  const params = [];
  for (const lang of languages) {
    params.push(profileId, lang.language, lang.repo_count);
  }

  await pool.execute(sql, params);
}


async function getProfileIdByUsername(username) {
  const [rows] = await pool.execute(
    'SELECT id FROM profiles WHERE username = ?',
    [username]
  );
  return rows.length > 0 ? rows[0].id : null;
}


async function findAll({ page = 1, limit = 20, sort = 'last_analyzed_at', order = 'desc' } = {}) {
  
  const sortColumn = ALLOWED_SORT_COLUMNS.includes(sort)
    ? sort
    : 'last_analyzed_at';
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  const sql = `
    SELECT * FROM profiles
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.execute(sql, [String(limit), String(offset)]);

  
  for (const profile of rows) {
    const [langs] = await pool.execute(
      'SELECT language, repo_count FROM profile_languages WHERE profile_id = ? ORDER BY repo_count DESC',
      [profile.id]
    );
    profile.top_languages = langs;
  }

  return rows;
}


async function getCount() {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as total FROM profiles'
  );
  return rows[0].total;
}


async function findByUsername(username) {
  const [rows] = await pool.execute(
    'SELECT * FROM profiles WHERE username = ?',
    [username]
  );

  if (rows.length === 0) return null;

  const profile = rows[0];

  
  const [langs] = await pool.execute(
    'SELECT language, repo_count FROM profile_languages WHERE profile_id = ? ORDER BY repo_count DESC',
    [profile.id]
  );
  profile.top_languages = langs;

  return profile;
}


async function deleteByUsername(username) {
  const [result] = await pool.execute(
    'DELETE FROM profiles WHERE username = ?',
    [username]
  );
  return result.affectedRows > 0;
}

module.exports = {
  upsertProfile,
  upsertLanguages,
  getProfileIdByUsername,
  findAll,
  getCount,
  findByUsername,
  deleteByUsername,
};
