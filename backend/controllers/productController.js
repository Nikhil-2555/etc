const Product = require('../models/Product');

// ── In-memory cache for product listing (avoids repeated DB round-trips) ──
let productsCache = null;
let productsCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

const invalidateProductsCache = () => {
    productsCache = null;
    productsCacheTime = 0;
};

// @desc Fetch all products
// @route GET /api/products
const getProducts = async (req, res) => {
    const now = Date.now();
    if (productsCache && (now - productsCacheTime) < CACHE_TTL_MS) {
        return res.json(productsCache);
    }
    const products = await Product.find({}).lean();
    productsCache = products;
    productsCacheTime = now;
    res.json(products);
};

// @desc Search products by title
// @route GET /api/products/search
const searchProducts = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.json([]);
        const products = await Product.find({
            title: { $regex: query, $options: 'i' }
        }).limit(6).lean();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Search failed' });
    }
};

// @desc Fetch single product
// @route GET /api/products/:id
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).lean();
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Invalid ID format' });
    }
};

// @desc Create a product
// @route POST /api/products
const createProduct = async (req, res) => {
    const { title, price, originalPrice, description, image, category, stock } = req.body;
    const product = new Product({
        title,
        price,
        originalPrice,
        description,
        image,
        category,
        stock,
        user: req.user._id,
    });

    const createdProduct = await product.save();
    invalidateProductsCache();
    res.status(201).json(createdProduct);
};

// @desc Update a product
// @route PUT /api/products/:id
const updateProduct = async (req, res) => {
    const { title, price, originalPrice, description, image, category, stock } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        const oldPrice = product.price;

        product.title = title || product.title;
        // Auto-set originalPrice if we drop the price and originalPrice was not provided explicitly
        if (price !== undefined && price < oldPrice && originalPrice === undefined && !product.originalPrice) {
            product.originalPrice = oldPrice;
        } else if (originalPrice !== undefined) {
            product.originalPrice = originalPrice;
        }
        product.price = price !== undefined ? price : product.price;
        product.description = description || product.description;
        product.image = image || product.image;
        product.category = category || product.category;
        product.stock = stock !== undefined ? stock : product.stock;

        const updatedProduct = await product.save();

        // Emit Real-Time Notification for Discount
        if (req.app.locals.io && updatedProduct.price < oldPrice) {
            req.app.locals.io.emit('notification', {
                title: 'Discount Alert! 🎉',
                message: `${updatedProduct.title} is now on sale for ₹${updatedProduct.price}! Grab it fast!`,
                type: 'success',
                link: '/sales'
            });
        }

        invalidateProductsCache();
        res.json(updatedProduct);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc Delete a product
// @route DELETE /api/products/:id
const deleteProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        await Product.deleteOne({ _id: product._id });
        invalidateProductsCache();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

module.exports = {
    getProducts,
    searchProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
