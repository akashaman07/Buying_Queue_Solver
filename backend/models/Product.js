const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price must be a positive number'],
    },
    barcode: {
      type: String,
      required: [true, 'Please add a barcode'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: [
        'Electronics',
        'Clothing',
        'Food',
        'Beverages',
        'Home',
        'Beauty',
        'Health',
        'Other',
      ],
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    stock: {
      type: Number,
      required: [true, 'Please add stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    seller: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    discount: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot be more than 100%'],
      default: 0,
    },
    tax: {
      type: Number,
      min: [0, 'Tax cannot be negative'],
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate final price with discount and tax
ProductSchema.virtual('finalPrice').get(function () {
  const discountAmount = (this.price * this.discount) / 100;
  const priceAfterDiscount = this.price - discountAmount;
  const taxAmount = (priceAfterDiscount * this.tax) / 100;
  return priceAfterDiscount + taxAmount;
});

module.exports = mongoose.model('Product', ProductSchema); 