const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Coupon = require('./models/Coupon');

dotenv.config({ path: './.env' });

const seedCoupons = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('MongoDB Connected');

        await Coupon.deleteMany();

        const coupons = [
            {
                code: 'FESTIVAL20',
                discountType: 'percentage',
                discountValue: 20,
                expiryDate: new Date('2026-12-31'),
                usageLimit: 100,
                description: 'Festival discount - 20% off',
            },
            {
                code: 'SAVE10',
                discountType: 'percentage',
                discountValue: 10,
                minOrderAmount: 2000,
                expiryDate: new Date('2026-12-31'),
                usageLimit: 500,
                description: '10% off on orders above ₹2000',
            },
            {
                code: 'B2G1',
                discountType: 'bogo',
                discountValue: 0,
                buyQuantity: 2,
                getQuantity: 1,
                expiryDate: new Date('2026-12-31'),
                usageLimit: 100,
                description: 'Buy 2 Get 1 Free',
            }
        ];

        await Coupon.insertMany(coupons);
        console.log('Coupons seeded successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding coupons:', error.message);
        process.exit(1);
    }
};

seedCoupons();
