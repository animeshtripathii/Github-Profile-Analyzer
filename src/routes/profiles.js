const express = require('express');
const router = express.Router();
const controller = require('../controllers/profile.controller');
const {
  validateUsername,
  validateListQuery,
  handleValidationErrors,
} = require('../middleware/validate');


router.post(
  '/analyze/:username',
  validateUsername,
  handleValidationErrors,
  controller.analyzeProfile
);


router.post(
  '/analyze/:username/refresh',
  validateUsername,
  handleValidationErrors,
  controller.refreshProfile
);


router.get(
  '/',
  validateListQuery,
  handleValidationErrors,
  controller.getAllProfiles
);


router.get(
  '/:username',
  validateUsername,
  handleValidationErrors,
  controller.getProfile
);


router.delete(
  '/:username',
  validateUsername,
  handleValidationErrors,
  controller.deleteProfile
);

module.exports = router;
