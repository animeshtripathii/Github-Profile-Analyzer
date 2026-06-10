const githubService = require('../services/github.service');
const profileModel = require('../models/profile.model');


async function analyzeProfile(req, res, next) {
  try {
    const { username } = req.params;

    
    const [profile, repos] = await Promise.all([
      githubService.fetchUserProfile(username),
      githubService.fetchUserRepos(username),
    ]);

    
    const insights = githubService.buildInsights(profile, repos);

    
    await profileModel.upsertProfile(insights);

    
    const profileId = await profileModel.getProfileIdByUsername(
      insights.username
    );

    
    await profileModel.upsertLanguages(profileId, insights.top_languages);

    
    const stored = await profileModel.findByUsername(insights.username);

    res.status(200).json({
      success: true,
      message: `Profile @${insights.username} analyzed and stored successfully.`,
      data: formatProfileResponse(stored),
    });
  } catch (error) {
    next(error);
  }
}



const refreshProfile = analyzeProfile;


async function getAllProfiles(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const sort = req.query.sort || 'last_analyzed_at';
    const order = req.query.order || 'desc';

    const [profiles, total] = await Promise.all([
      profileModel.findAll({ page, limit, sort, order }),
      profileModel.getCount(),
    ]);

    res.status(200).json({
      success: true,
      data: profiles.map(formatProfileResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}


async function getProfile(req, res, next) {
  try {
    const { username } = req.params;
    const profile = await profileModel.findByUsername(username);

    if (!profile) {
      const err = new Error(
        `Profile @${username} not found. Use POST /api/profiles/analyze/${username} to analyze it first.`
      );
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      success: true,
      data: formatProfileResponse(profile),
    });
  } catch (error) {
    next(error);
  }
}


async function deleteProfile(req, res, next) {
  try {
    const { username } = req.params;
    const deleted = await profileModel.deleteByUsername(username);

    if (!deleted) {
      const err = new Error(`Profile @${username} not found.`);
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      success: true,
      message: `Profile @${username} and associated data deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
}


function formatProfileResponse(profile) {
  const topLangs = profile.top_languages || [];
  return {
    login: profile.username,
    username: profile.username,
    name: profile.name,
    bio: profile.bio,
    location: profile.location,
    avatar_url: profile.avatar_url,
    profile_url: profile.profile_url,
    github_id: profile.github_id,
    followers: profile.followers,
    following: profile.following,
    public_repos: profile.public_repos,
    total_stars: profile.total_stars,
    total_forks: profile.total_forks,
    original_repos: profile.original_repos,
    forked_repos: profile.forked_repos,
    most_starred_repo: profile.most_starred_repo,
    follower_to_repo_ratio: parseFloat(profile.follower_to_repo_ratio),
    top_languages: topLangs,
    top_language: topLangs.length > 0 ? topLangs[0].language : null,
    account_created_at: profile.account_created_at,
    last_analyzed_at: profile.last_analyzed_at,
  };
}

module.exports = {
  analyzeProfile,
  refreshProfile,
  getAllProfiles,
  getProfile,
  deleteProfile,
};
