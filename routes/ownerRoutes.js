const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { requireOwner } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

router.get('/owner_dashboard', requireOwner, ownerController.getOwnerDashboard);
router.get('/owner_bookings', requireOwner, ownerController.getOwnerDashboard);
router.get('/owner_complaints', requireOwner, ownerController.getOwnerComplaints);
router.get('/resolve_complaint/:id', requireOwner, ownerController.resolveComplaint);

// Room management
router.get('/add_room/:hostel_id', requireOwner, ownerController.showAddRoom);
router.post('/add_room/:hostel_id', requireOwner, uploadMultiple('room_images', 3), ownerController.addRoom);

// Payment settings
router.get('/payment_settings', requireOwner, ownerController.showPaymentSettings);
router.post('/save_payment_settings', requireOwner, ownerController.savePaymentSettings);

module.exports = router;
