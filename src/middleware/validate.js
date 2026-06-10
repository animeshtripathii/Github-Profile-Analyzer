const { param, query, validationResult } = require('express-validator');


const validateUsername = [
  param('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required.')
    .matches(/^[a-zA-Z\d](?:[a-zA-Z\d]|-(?=[a-zA-Z\d])){0,38}$/)
    .withMessage(
      'Invalid GitHub username. Must be 1-39 characters, alphanumeric or hyphens, and cannot begin or end with a hyphen.'
    ),
];


const validateListQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer.')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100.')
    .toInt(),
  query('sort')
    .optional()
    .isIn(['last_analyzed_at', 'followers', 'total_stars', 'public_repos', 'username'])
    .withMessage(
      'Sort must be one of: last_analyzed_at, followers, total_stars, public_repos, username.'
    ),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be either asc or desc.'),
];


function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed.',
        details: errors.array().map((e) => ({
          field: e.path,
          message: e.msg,
        })),
      },
    });
  }
  next();
}

module.exports = {
  validateUsername,
  validateListQuery,
  handleValidationErrors,
};
