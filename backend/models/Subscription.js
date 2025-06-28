const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    plan: {
      type: String,
      enum: ['basic', 'premium', 'business'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'trialing', 'unpaid', 'incomplete'],
      default: 'active',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    interval: {
      type: String,
      enum: ['day', 'week', 'month', 'year'],
      default: 'month',
    },
    stripeSubscriptionId: {
      type: String,
    },
    stripeCustomerId: {
      type: String,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    canceledAt: {
      type: Date,
    },
    features: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Populate user when finding subscriptions
SubscriptionSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name email',
  });
  next();
});

module.exports = mongoose.model('Subscription', SubscriptionSchema); 