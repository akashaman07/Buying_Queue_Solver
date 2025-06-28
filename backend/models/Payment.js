const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.ObjectId,
      ref: 'Order',
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'usd',
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'paypal', 'cash', 'razorpay'],
      required: true,
    },
    stripePaymentIntentId: {
      type: String,
    },
    stripeCustomerId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpayOrderId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'pending',
    },
    receiptUrl: {
      type: String,
    },
    refundId: {
      type: String,
    },
    refundReason: {
      type: String,
    },
    refundAmount: {
      type: Number,
    },
    refundDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Populate order and user when finding payments
PaymentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'order',
    select: 'totalAmount status',
  }).populate({
    path: 'user',
    select: 'name email',
  });
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema); 