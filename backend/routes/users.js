const express = require('express');
const { check } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Import controllers
// Note: We'll implement these controllers later as needed
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
} = require('../controllers/userController');

// Routes for admin only
router
  .route('/')
  .get(protect, authorize('admin'), getUsers)
  .post(
    [
      check('name', 'Name is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check('password', 'Please enter a password with 6 or more characters').isLength({
        min: 6,
      }),
      check('role', 'Role is required').not().isEmpty(),
    ],
    protect,
    authorize('admin'),
    createUser
  );

router
  .route('/:id')
  .get(protect, authorize('admin'), getUser)
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

// Route for updating own profile
router.put('/profile/update', protect, updateProfile);

module.exports = router; 