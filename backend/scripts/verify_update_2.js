const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();

const verifyUpdate = async () => {
    try {
        await connectDB();

        const castPot = await Product.findOne({ title: 'Cast Iron Pot' });
        const proCooker = await Product.findOne({ title: 'Pro Cooker' });

        console.log('\n--- VERIFICATION ---');

        if (castPot) {
            console.log(`✅ FOUND: Cast Iron Pot`);
            console.log(`   Image: ${castPot.image}`);
        } else {
            console.log(`❌ MISSING: Cast Iron Pot`);
        }

        if (proCooker) {
            console.log(`✅ FOUND: Pro Cooker`);
            console.log(`   Image: ${proCooker.image}`);
        } else {
            console.log(`❌ MISSING: Pro Cooker`);
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verifyUpdate();
