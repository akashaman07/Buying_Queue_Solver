const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { uploadImage, deleteImage } = require('../utils/cloudinary');

// @desc    Upload product image
// @route   POST /api/products/:id/image
// @access  Private (Seller/Admin)
exports.uploadProductImage = async (req, res, next) => {
  try {
    // Check if product exists
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      // Remove uploaded file if product doesn't exist
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }
    
    // Make sure user is product seller or admin
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      // Remove uploaded file if user is not authorized
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to update this product`, 403)
      );
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }
    
    // Upload to cloudinary
    const result = await uploadImage(req.file.path);
    
    // Add image to product
    product.images.push({
      public_id: result.public_id,
      url: result.url
    });
    
    await product.save();
    
    // Remove file from local storage
    fs.unlinkSync(req.file.path);
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    // Remove uploaded file if there's an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    // Check if MongoDB is connected, if not use mock data
    if (req.mockData && !mongoose.connection.readyState) {
      const mockProducts = req.mockData.products;
      
      // Apply any filtering if needed
      let filteredProducts = [...mockProducts];
      
      // Pagination for mock data
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const total = filteredProducts.length;
      
      filteredProducts = filteredProducts.slice(startIndex, endIndex);
      
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
      
      return res.status(200).json({
        success: true,
        count: filteredProducts.length,
        pagination,
        data: filteredProducts,
      });
    }
    
    // If MongoDB is connected, proceed with normal query
    // Build query
    const query = {};
    
    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by availability
    if (req.query.isAvailable) {
      query.isAvailable = req.query.isAvailable === 'true';
    }
    
    // Filter by seller
    if (req.query.seller) {
      query.seller = req.query.seller;
    }
    
    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) {
        query.price.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query.price.$lte = parseFloat(req.query.maxPrice);
      }
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate('seller', 'name email')
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
      count: products.length,
      pagination,
      data: products,
    });
  } catch (error) {
    // If there's an error with MongoDB, use mock data
    if (req.mockData) {
      const mockProducts = req.mockData.products;
      
      // Apply simple pagination
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = Math.min(page * limit, mockProducts.length);
      
      const paginatedProducts = mockProducts.slice(startIndex, endIndex);
      
      return res.status(200).json({
        success: true,
        count: paginatedProducts.length,
        pagination: {
          total: mockProducts.length,
          page,
          limit
        },
        data: paginatedProducts,
      });
    }
    
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    // Check if MongoDB is connected, if not use mock data
    if (req.mockData && !mongoose.connection.readyState) {
      const product = req.mockData.products.find(p => p._id === req.params.id);
      
      if (!product) {
        return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
      }
      
      return res.status(200).json({
        success: true,
        data: product,
      });
    }
    
    const product = await Product.findById(req.params.id).populate('seller', 'name email');

    if (!product) {
      return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    // If there's an error with MongoDB, check mock data
    if (req.mockData) {
      const product = req.mockData.products.find(p => p._id === req.params.id);
      
      if (product) {
        return res.status(200).json({
          success: true,
          data: product,
        });
      }
    }
    
    next(error);
  }
};

// @desc    Get product by barcode
// @route   GET /api/products/barcode/:barcode
// @access  Public
exports.getProductByBarcode = async (req, res, next) => {
  try {
    // Check if MongoDB is connected, if not use mock data
    if (req.mockData && !mongoose.connection.readyState) {
      const product = req.mockData.products.find(p => p.barcode === req.params.barcode);
      
      if (!product) {
        return next(new ErrorResponse(`Product not found with barcode of ${req.params.barcode}`, 404));
      }
      
      return res.status(200).json({
        success: true,
        data: product,
      });
    }
    
    const product = await Product.findOne({ barcode: req.params.barcode }).populate(
      'seller',
      'name email'
    );

    if (!product) {
      return next(new ErrorResponse(`Product not found with barcode of ${req.params.barcode}`, 404));
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    // If there's an error with MongoDB, check mock data
    if (req.mockData) {
      const product = req.mockData.products.find(p => p.barcode === req.params.barcode);
      
      if (product) {
        return res.status(200).json({
          success: true,
          data: product,
        });
      }
    }
    
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Seller/Admin)
exports.createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // Add seller to req.body
    req.body.seller = req.user.id;

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Seller/Admin)
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is product seller or admin
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to update this product`, 403)
      );
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Seller/Admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is product seller or admin
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to delete this product`, 403)
      );
    }

    await product.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
}; 