const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const updateAdmin = async () => {
    try {
        // The password will be hashed by the mongoose 'pre' save hook automatically
        // Do not hash it here.
        const plainPassword = 'admin@123';

        // Update existing admin or create new one if not exists
        let admin = await User.findOne({ email: 'admin@gmail.com' });
        
        if (!admin) {
             admin = await User.findOne({ role: 'admin' });
        }
        
        if (admin) {
            admin.email = 'admin@gmail.com';
            admin.password = plainPassword;
            await admin.save();
            console.log('Admin user updated successfully');
        } else {
            await User.create({
                name: 'Admin User',
                email: 'admin@gmail.com',
                password: plainPassword,
                role: 'admin'
            });
            console.log('Admin user created successfully');
        }
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

updateAdmin();
