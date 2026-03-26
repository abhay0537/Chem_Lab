const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUserRole, toggleUserStatus } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin', 'superadmin'), getUsers);
router.get('/:id', protect, authorize('admin', 'superadmin'), getUser);
router.patch('/:id/role', protect, authorize('superadmin'), updateUserRole);
router.patch('/:id/toggle-status', protect, authorize('admin', 'superadmin'), toggleUserStatus);

module.exports = router;
