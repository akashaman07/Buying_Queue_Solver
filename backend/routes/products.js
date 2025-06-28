const express = require('express');
const { check } = require('express-validator');
const {
  getProducts,
  getProduct,
  getProductByBarcode,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { handleUpload } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/barcode/:barcode', getProductByBarcode);
router.get('/:id', getProduct);

// Protected routes for sellers and admins
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('price', 'Price is required and must be a number').isNumeric(),
    check('barcode', 'Barcode is required').not().isEmpty(),
    check('category', 'Category is required').not().isEmpty(),
    check('stock', 'Stock is required and must be a number').isNumeric(),
  ],
  protect,
  authorize('seller', 'admin'),
  createProduct
);

router.put('/:id', protect, authorize('seller', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('seller', 'admin'), deleteProduct);

// Image upload route
router.post(
  '/:id/image',
  protect,
  authorize('seller', 'admin'),
  handleUpload,
  uploadProductImage
);

module.exports = router; 