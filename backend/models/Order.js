const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'paypal', 'cash'],
      required: true,
    },
    paymentDetails: {
      transactionId: String,
      paymentDate: Date,
    },
    status: {
      type: String,
      enum: ['placed', 'processing', 'completed', 'cancelled'],
      default: 'placed',
    },
    qrCode: {
      type: String,
    },
    invoiceUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Populate products when finding orders
OrderSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name email',
  }).populate({
    path: 'products.product',
    select: 'name price images',
  });
  next();
});

module.exports = mongoose.model('Order', OrderSchema);