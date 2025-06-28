const Order = require('../models/Order');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const { validationResult } = require('express-validator');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    let query;

    // If user is not admin, show only their orders
    if (req.user.role !== 'admin') {
      if (req.user.role === 'seller') {
        // For sellers, find orders that contain their products
        const products = await Product.find({ seller: req.user.id });
        const productIds = products.map(product => product._id);
        
        query = Order.find({
          'products.product': { $in: productIds }
        });
      } else {
        // For customers, find only their orders
        query = Order.find({ user: req.user.id });
      }
    } else {
      // For admins, find all orders
      query = Order.find();
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Order.countDocuments();

    const orders = await query
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
      count: orders.length,
      pagination,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is order owner, seller of products in order, or admin
    if (
      order.user.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      req.user.role !== 'seller'
    ) {
      return next(new ErrorResponse(`Not authorized to access this order`, 403));
    }

    if (req.user.role === 'seller') {
      // Check if seller has products in this order
      const products = await Product.find({ seller: req.user.id });
      const productIds = products.map(product => product._id.toString());
      
      const hasSellerProducts = order.products.some(item => 
        productIds.includes(item.product.toString())
      );
      
      if (!hasSellerProducts) {
        return next(new ErrorResponse(`Not authorized to access this order`, 403));
      }
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer)
exports.createOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { products, paymentMethod } = req.body;

    if (!products || products.length === 0) {
      return next(new ErrorResponse('Please add at least one product to the order', 400));
    }

    // Validate products and calculate total amount
    let totalAmount = 0;
    const orderProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return next(new ErrorResponse(`Product not found with id of ${item.product}`, 404));
      }
      
      if (item.quantity > product.stock) {
        return next(
          new ErrorResponse(
            `Insufficient stock for product ${product.name}. Available: ${product.stock}`,
            400
          )
        );
      }
      
      // Calculate price with discount and tax
      const finalPrice = product.finalPrice;
      
      // Add to order products
      orderProducts.push({
        product: item.product,
        quantity: item.quantity,
        price: finalPrice,
      });
      
      // Add to total amount
      totalAmount += finalPrice * item.quantity;
      
      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create order
    const order = await Order.create({
      user: req.user.id,
      products: orderProducts,
      totalAmount,
      paymentMethod,
      status: 'placed',
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private (Admin/Seller)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return next(new ErrorResponse('Please provide a status', 400));
    }

    let order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is admin or seller of products in order
    if (req.user.role !== 'admin' && req.user.role !== 'seller') {
      return next(new ErrorResponse(`Not authorized to update this order`, 403));
    }

    if (req.user.role === 'seller') {
      // Check if seller has products in this order
      const products = await Product.find({ seller: req.user.id });
      const productIds = products.map(product => product._id.toString());
      
      const hasSellerProducts = order.products.some(item => 
        productIds.includes(item.product.toString())
      );
      
      if (!hasSellerProducts) {
        return next(new ErrorResponse(`Not authorized to update this order`, 403));
      }
    }

    order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Customer/Admin)
exports.cancelOrder = async (req, res, next) => {
  try {
    let order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorResponse(`Order not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is order owner or admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Not authorized to cancel this order`, 403));
    }

    // Check if order is already completed or cancelled
    if (order.status === 'completed' || order.status === 'cancelled') {
      return next(
        new ErrorResponse(`Order cannot be cancelled as it is already ${order.status}`, 400)
      );
    }

    // Update order status
    order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      {
        new: true,
        runValidators: true,
      }
    );

    // Restore product stock
    for (const item of order.products) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
}; 