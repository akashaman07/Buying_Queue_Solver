const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const ErrorResponse = require('../utils/errorResponse');
const { validationResult } = require('express-validator');

// Initialize Razorpay with fallback for development
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
} catch (error) {
  console.warn('Razorpay initialization failed. Using mock payment mode.');
  // Create a mock Razorpay object for development
  razorpay = {
    orders: {
      create: async (options) => {
        console.log('MOCK: Creating Razorpay order', options);
        return {
          id: `mock_order_${Date.now()}`,
          amount: options.amount,
          currency: options.currency,
          receipt: options.receipt,
          status: 'created'
        };
      }
    },
    payments: {
      refund: async (paymentId, options) => {
        console.log('MOCK: Processing refund for payment', paymentId, options);
        return {
          id: `mock_refund_${Date.now()}`,
          payment_id: paymentId,
          amount: options.amount,
          status: 'processed'
        };
      },
      fetch: async (paymentId) => {
        console.log('MOCK: Fetching payment details', paymentId);
        return {
          id: paymentId,
          status: 'captured',
          amount: 1000,
          currency: 'USD'
        };
      }
    }
  };
}

// @desc    Create payment order
// @route   POST /api/payments/create-payment-intent
// @access  Private
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return next(new ErrorResponse('Please provide an order ID', 400));
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${orderId}`, 404));
    }

    // Make sure user is order owner
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Not authorized to make payment for this order`, 403));
    }

    // Check if order is already paid
    if (order.paymentStatus === 'completed') {
      return next(new ErrorResponse('This order has already been paid', 400));
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100), // Convert to smallest currency unit
      currency: 'USD',
      receipt: `order_${order._id}`,
      notes: {
        orderId: order._id.toString(),
        userId: req.user.id,
      },
    });

    res.status(200).json({
      success: true,
      order: razorpayOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process payment
// @route   POST /api/payments/process
// @access  Private
exports.processPayment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, orderId } = req.body;

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature || !orderId) {
      return next(new ErrorResponse('Please provide all required payment details', 400));
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${orderId}`, 404));
    }

    // Make sure user is order owner
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Not authorized to process payment for this order`, 403));
    }

    // Verify the payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'mock_key_secret')
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    // Skip signature verification in development if using mock Razorpay
    if (process.env.NODE_ENV === 'production' && generatedSignature !== razorpaySignature) {
      return next(new ErrorResponse('Invalid payment signature', 400));
    }

    // Update order payment status
    order.paymentStatus = 'completed';
    order.paymentDetails = {
      transactionId: razorpayPaymentId,
      paymentDate: new Date(),
    };
    await order.save();

    // Create payment record
    const payment = await Payment.create({
      order: orderId,
      user: req.user.id,
      amount: order.totalAmount,
      paymentMethod: 'razorpay',
      razorpayPaymentId,
      razorpayOrderId,
      status: 'succeeded',
    });

    // Generate QR code for the order (in a real app, you'd use a QR code library)
    order.qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${order._id}`;
    await order.save();

    res.status(200).json({
      success: true,
      data: {
        order,
        payment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return next(new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is payment owner or admin
    if (payment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Not authorized to access this payment`, 403));
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments for user
// @route   GET /api/payments
// @access  Private
exports.getPayments = async (req, res, next) => {
  try {
    let query;

    // If user is not admin, show only their payments
    if (req.user.role !== 'admin') {
      query = Payment.find({ user: req.user.id });
    } else {
      // For admins, find all payments
      query = Payment.find();
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Payment.countDocuments();

    const payments = await query
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: payments.length,
      pagination,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process refund
// @route   POST /api/payments/:id/refund
// @access  Private (Admin)
exports.processRefund = async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return next(new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404));
    }

    // Only admin can process refunds
    if (req.user.role !== 'admin') {
      return next(new ErrorResponse(`Not authorized to process refunds`, 403));
    }

    // Check if payment can be refunded
    if (payment.status !== 'succeeded') {
      return next(new ErrorResponse(`Payment cannot be refunded as it is ${payment.status}`, 400));
    }

    if (!payment.razorpayPaymentId) {
      return next(new ErrorResponse('No payment ID found for this payment', 400));
    }

    // Process refund with Razorpay
    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: Math.round(payment.amount * 100), // Convert to smallest currency unit
      notes: {
        reason: reason || 'Customer request',
        orderId: payment.order.toString(),
      }
    });

    // Update payment status
    payment.status = 'refunded';
    payment.refundId = refund.id;
    payment.refundReason = reason || 'Customer request';
    payment.refundAmount = payment.amount;
    payment.refundDate = new Date();
    await payment.save();

    // Update order payment status
    const order = await Order.findById(payment.order);
    if (order) {
      order.paymentStatus = 'refunded';
      await order.save();
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment receipt
// @route   GET /api/payments/:id/receipt
// @access  Private
exports.getPaymentReceipt = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return next(new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is payment owner or admin
    if (payment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Not authorized to access this payment receipt`, 403));
    }

    // For Razorpay, we need to generate a receipt or redirect to their receipt page
    // This is a simplified example - in a real app, you might generate a PDF or HTML receipt
    const receiptData = {
      paymentId: payment.razorpayPaymentId,
      orderId: payment.razorpayOrderId,
      amount: payment.amount,
      date: payment.createdAt,
      status: payment.status,
    };

    res.status(200).json({
      success: true,
      data: receiptData,
    });
  } catch (error) {
    next(error);
  }
}; 