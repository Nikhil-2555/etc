const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

const Order = require(path.join(__dirname, '..', 'models', 'Order'));
const Product = require(path.join(__dirname, '..', 'models', 'Product'));
const User = require(path.join(__dirname, '..', 'models', 'User'));
const connectDB = require(path.join(__dirname, '..', 'config', 'db'));

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedOrders = async () => {
    try {
        await connectDB();
        await Order.deleteMany({}); 

        const products = await Product.find({});
        const users = await User.find({ role: 'user' });

        if (products.length === 0 || users.length === 0) {
            console.error('No products or users found. Please run seeder.js first.');
            process.exit(1);
        }

        const orders = [];
        const statuses = ['pending', 'processing', 'shipped', 'delivered', 'delivered', 'delivered', 'cancelled']; 
        // weighted towards delivered
        
        // Generate 350 random orders over the last 180 days
        for (let i = 0; i < 350; i++) {
            const user = users[Math.floor(Math.random() * users.length)];
            
            // Random date between now and 180 days ago
            // We want more orders recently to show a nice upward growth trend
            const isRecent = Math.random() > 0.4; // 60% chance of being in the last 60 days
            const daysAgo = isRecent 
                ? Math.floor(Math.random() * 60) 
                : Math.floor(Math.random() * 120) + 60;

            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            
            const numItems = Math.floor(Math.random() * 3) + 1;
            const orderItems = [];
            let totalPrice = 0;

            for (let j = 0; j < numItems; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 2) + 1;
                
                orderItems.push({
                    title: product.title || product.name,
                    quantity,
                    image: product.image,
                    price: product.price,
                    product: product._id
                });
                
                totalPrice += product.price * quantity;
            }

            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const isDelivered = status === 'delivered';
            const isPaid = status !== 'cancelled' && status !== 'pending';

            orders.push({
                user: user._id,
                orderItems,
                shippingAddress: {
                    address: '123 Fake Street',
                    city: 'Mumbai',
                    postalCode: '400001',
                    country: 'India'
                },
                paymentMethod: 'Stripe',
                paymentStatus: isPaid ? 'Paid' : 'Pending',
                orderStatus: status === 'delivered' ? 'Delivered' : 'Placed',
                totalPrice,
                isPaid,
                paidAt: isPaid ? date : null,
                isDelivered,
                deliveredAt: isDelivered ? date : null,
                status,
                createdAt: date,
                updatedAt: date
            });
        }

        // Use collection.insertMany to bypass mongoose timestamps overwriting our custom createdAt dates
        await Order.collection.insertMany(orders);
        console.log(`Successfully seeded ${orders.length} realistic historical orders for Analytics graphs!`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedOrders();
