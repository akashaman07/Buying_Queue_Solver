const express = require('express');
const { check } = require('express-validator');
const {
  createPaymentIntent,
  processPayment,
  getPayment,
  getPayments,
  processRefund,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes for all authenticated users
router.get('/', getPayments);
router.get('/:id', getPayment);

// Routes for payment processing (customers only)
router.post(
  '/create-payment-intent',
  [check('orderId', 'Order ID is required').not().isEmpty()],
  authorize('customer'),
  createPaymentIntent
);

router.post(
  '/process',
  [
    check('paymentIntentId', 'Payment intent ID is required').not().isEmpty(),
    check('orderId', 'Order ID is required').not().isEmpty(),
  ],
  authorize('customer'),
  processPayment
);

// Route for refunds (admin only)
router.post('/:id/refund', authorize('admin'), processRefund);

module.exports = router;