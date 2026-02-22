const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    rating: {
        rate: { type: Number, default: 0 },
        count: { type: Number, default: 0 },
    },
    stock: { type: Number, default: 100 },
    sizes: { type: [String], default: [] },
}, {
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
