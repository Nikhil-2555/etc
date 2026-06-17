const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();

const checkUniqueness = async () => {
    try {
        await connectDB();

        const products = await Product.find({});
        console.log(`\nChecked ${products.length} products for duplicate images.`);

        const usage = {};
        const duplicates = [];

        products.forEach(p => {
            if (usage[p.image]) {
                duplicates.push({ title: p.title, image: p.image, dup_of: usage[p.image] });
            } else {
                usage[p.image] = p.title;
            }
        });

        if (duplicates.length === 0) {
            console.log('✅ SUCCESS: All 100 product images are UNIQUE.');
        } else {
            console.log('❌ FAILURE: Found duplicates!');
            duplicates.forEach(d => console.log(`- ${d.title} uses same image as ${d.dup_of}`));
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

checkUniqueness();
