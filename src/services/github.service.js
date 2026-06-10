const axios = require('axios');


const githubApi = axios.create({
  baseURL: 'https://api.github.com',
  timeout: 15000,
  headers: {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'github-profile-analyzer',
  },
});


if (process.env.GITHUB_TOKEN) {
  githubApi.defaults.headers.common['Authorization'] =
    `Bearer ${process.env.GITHUB_TOKEN}`;
}


async function fetchUserProfile(username) {
  try {
    const { data } = await githubApi.get(`/users/${username}`);
    return data;
  } catch (error) {
    handleGitHubError(error, username);
  }
}


async function fetchUserRepos(username) {
  const repos = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    try {
      const { data } = await githubApi.get(`/users/${username}/repos`, {
        params: {
          per_page: perPage,
          page,
          type: 'owner',
          sort: 'updated',
        },
      });

      repos.push(...data);

      
      if (data.length < perPage) break;
      page++;
    } catch (error) {
      handleGitHubError(error, username);
    }
  }

  return repos;
}


function buildInsights(profile, repos) {
  let totalStars = 0;
  let totalForks = 0;
  let originalRepos = 0;
  let forkedRepos = 0;
  let mostStarredRepo = null;
  let maxStars = -1;
  const languageMap = {};

  for (const repo of repos) {
    totalStars += repo.stargazers_count || 0;
    totalForks += repo.forks_count || 0;

    if (repo.fork) {
      forkedRepos++;
    } else {
      originalRepos++;
    }

    if (repo.stargazers_count > maxStars) {
      maxStars = repo.stargazers_count;
      mostStarredRepo = repo.name;
    }

    if (repo.language) {
      languageMap[repo.language] = (languageMap[repo.language] || 0) + 1;
    }
  }

  
  const topLanguages = Object.entries(languageMap)
    .map(([language, repo_count]) => ({ language, repo_count }))
    .sort((a, b) => b.repo_count - a.repo_count)
    .slice(0, 5);

  const followerToRepoRatio =
    profile.public_repos > 0
      ? parseFloat((profile.followers / profile.public_repos).toFixed(2))
      : 0;

  return {
    github_id: profile.id,
    username: profile.login,
    name: profile.name || null,
    bio: profile.bio || null,
    location: profile.location || null,
    avatar_url: profile.avatar_url || null,
    profile_url: profile.html_url || null,
    followers: profile.followers || 0,
    following: profile.following || 0,
    public_repos: profile.public_repos || 0,
    total_stars: totalStars,
    total_forks: totalForks,
    original_repos: originalRepos,
    forked_repos: forkedRepos,
    most_starred_repo: mostStarredRepo,
    follower_to_repo_ratio: followerToRepoRatio,
    account_created_at: profile.created_at
      ? new Date(profile.created_at)
      : null,
    top_languages: topLanguages,
  };
}


function handleGitHubError(error, username) {
  if (error.response) {
    const { status } = error.response;

    if (status === 404) {
      const err = new Error(`GitHub user '${username}' not found.`);
      err.statusCode = 404;
      throw err;
    }

    if (status === 403) {
      const rateLimitReset = error.response.headers['x-ratelimit-reset'];
      let message = 'GitHub API rate limit exceeded.';
      if (rateLimitReset) {
        const resetTime = new Date(rateLimitReset * 1000).toISOString();
        message += ` Resets at ${resetTime}.`;
      }
      if (!process.env.GITHUB_TOKEN) {
        message +=
          ' Tip: Set a GITHUB_TOKEN in .env to increase the limit to 5,000 requests/hour.';
      }
      const err = new Error(message);
      err.statusCode = 403;
      throw err;
    }

    const err = new Error(
      `GitHub API responded with status ${status}: ${error.response.data?.message || 'Unknown error'}`
    );
    err.statusCode = status >= 500 ? 502 : status;
    throw err;
  }

  
  const err = new Error(
    'Unable to reach the GitHub API. Please check your network connection.'
  );
  err.statusCode = 502;
  throw err;
}

module.exports = { fetchUserProfile, fetchUserRepos, buildInsights };
