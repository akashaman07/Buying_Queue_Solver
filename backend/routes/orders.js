const express = require('express');
const { check } = require('express-validator');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes for all authenticated users
router.get('/', getOrders);
router.get('/:id', getOrder);

// Routes for customers
router.post(
  '/',
  [
    check('products', 'Products are required').isArray(),
    check('products.*.product', 'Product ID is required').not().isEmpty(),
    check('products.*.quantity', 'Quantity is required and must be a number').isNumeric(),
    check('paymentMethod', 'Payment method is required').not().isEmpty(),
  ],
  authorize('customer'),
  createOrder
);

// Route for cancelling order (customer or admin)
router.put('/:id/cancel', cancelOrder);

// Routes for sellers and admins
router.put(
  '/:id',
  [check('status', 'Status is required').not().isEmpty()],
  authorize('seller', 'admin'),
  updateOrderStatus
);

module.exports = router; 