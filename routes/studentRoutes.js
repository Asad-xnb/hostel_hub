const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { requireAuth, requireStudent } = require('../middleware/auth');

router.get('/student_dashboard', requireStudent, studentController.getStudentDashboard);

module.exports = router;
