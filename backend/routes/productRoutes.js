const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getProducts,
    searchProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

// @route GET /api/products
router.get('/', getProducts);

// @route GET /api/products/search
router.get('/search', searchProducts);

// @route GET /api/products/:id
router.get('/:id', getProductById);

// @route POST /api/products
router.post('/', protect, admin, createProduct);

// @route PUT /api/products/:id
router.put('/:id', protect, admin, updateProduct);

// @route DELETE /api/products/:id
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
