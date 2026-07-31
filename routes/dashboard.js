const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getRecentRegistrations,
  getPatientStatistics
} = require('../controllers/dashboardController');

router.get('/stats', authMiddleware, authorize('Administrator'), getDashboardStats);
router.get('/recent-registrations', authMiddleware, authorize('Administrator'), getRecentRegistrations);
router.get('/patient-statistics', authMiddleware, authorize('Administrator'), getPatientStatistics);

module.exports = router;