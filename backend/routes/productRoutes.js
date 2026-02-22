const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc Fetch all products
// @route GET /api/products
router.get('/', async (req, res) => {
    const products = await Product.find({});
    res.json(products);
});

// @desc Fetch single product
// @route GET /api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Invalid ID format' });
    }
});

// @desc Create a product
// @route POST /api/products
router.post('/', protect, admin, async (req, res) => {
    const { title, price, description, image, category, stock } = req.body;
    const product = new Product({
        title,
        price,
        description,
        image,
        category,
        stock,
        user: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

// @desc Update a product
// @route PUT /api/products/:id
router.put('/:id', protect, admin, async (req, res) => {
    const { title, price, description, image, category, stock } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        product.title = title || product.title;
        product.price = price || product.price;
        product.description = description || product.description;
        product.image = image || product.image;
        product.category = category || product.category;
        product.stock = stock !== undefined ? stock : product.stock;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

// @desc Delete a product
// @route DELETE /api/products/:id
router.delete('/:id', protect, admin, async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        await Product.deleteOne({ _id: product._id });
        res.json({ message: 'Product removed' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

module.exports = router;
