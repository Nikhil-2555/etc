const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();

const verifyData = async () => {
    try {
        await connectDB();

        console.log('\n--- VERIFICATION REPORT ---');

        const count = await Product.countDocuments();
        console.log(`Total Products in Database: ${count}`);

        const checks = [
            'Apple Watch S9',
            'Stand Mixer',
            'Cycling Lid',
            'Secrid Wallet',
            'Digital Tablet'
        ];

        console.log('\nChecking Specific Updated Products:');
        for (const title of checks) {
            const p = await Product.findOne({ title });
            if (p) {
                console.log(`✅ Found "${title}"`);
                console.log(`   Image: ${p.image}`);
            } else {
                console.log(`❌ Missing "${title}"`);
            }
        }

        console.log('\n---------------------------');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

verifyData();
