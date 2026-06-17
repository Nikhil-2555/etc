const mongoose = require('mongoose');

const connectDB = async () => {
    const maxRetries = 5;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            const conn = await mongoose.connect(process.env.MONGODB_URI, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });

            console.log(`MongoDB Connected: ${conn.connection.host}`);

            // Handle connection events
            mongoose.connection.on('error', (err) => {
                console.error('MongoDB connection error:', err.message);
            });

            mongoose.connection.on('disconnected', () => {
                console.warn('MongoDB disconnected. Attempting to reconnect...');
            });

            mongoose.connection.on('reconnected', () => {
                console.log('MongoDB reconnected successfully.');
            });

            return; // Successfully connected, exit the function
        } catch (error) {
            retries++;
            console.error(`MongoDB connection attempt ${retries}/${maxRetries} failed: ${error.message}`);

            if (retries >= maxRetries) {
                console.error('All MongoDB connection attempts failed. Exiting...');
                process.exit(1);
            }

            // Wait before retrying (exponential backoff)
            const waitTime = Math.min(1000 * Math.pow(2, retries), 10000);
            console.log(`Retrying in ${waitTime / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
};

module.exports = connectDB;
