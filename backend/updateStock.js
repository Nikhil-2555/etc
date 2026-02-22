const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const updateLowStock = async () => {
    try {
        // Update specific products to have CRITICALLY low stock (< 2 units)
        const lowStockUpdates = [
            { title: 'Apple iPhone 15 Pro', stock: 0 },
            { title: 'Sony WH-1000XM5', stock: 1 },
            { title: 'Nike Air Jordan', stock: 0 },
            { title: 'MacBook Air M3', stock: 1 },
            { title: 'PlayStation 5', stock: 1 },
            { title: 'Apple Watch S9', stock: 0 },
            { title: 'Nike Air Max', stock: 1 },
            { title: 'Adidas Ultraboost', stock: 1 }
        ];

        for (const update of lowStockUpdates) {
            await Product.updateOne(
                { title: update.title },
                { $set: { stock: update.stock } }
            );
            console.log(`Updated ${update.title} to stock: ${update.stock}`);
        }

        // Update remaining products to have normal stock (50-100 units)
        await Product.updateMany(
            { stock: { $exists: false } },
            { $set: { stock: 50 } }
        );

        console.log('\n✅ Stock levels updated successfully!');
        console.log('🚨 8 products now have CRITICALLY LOW STOCK (< 2 units)');
        console.log('📦 All other products have normal stock levels');

        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

updateLowStock();
