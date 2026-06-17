const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './.env' });

async function updateAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Find existing admin or create a new one
        let admin = await User.findOne({ email: 'admin@shop.com' });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('12345678', salt);

        if (admin) {
            admin.email = 'shopflow@gmail.com';
            admin.password = '12345678';
            await admin.save();
            console.log('Updated existing admin@shop.com to shopflow@gmail.com');
        } else {
            // Check if shopflow@gmail.com already exists
            admin = await User.findOne({ email: 'shopflow@gmail.com' });
            if (admin) {
                admin.password = '12345678';
                admin.role = 'admin';
                await admin.save();
                console.log('Updated existing shopflow@gmail.com password and role');
            } else {
                await User.create({
                    name: 'Admin User',
                    email: 'shopflow@gmail.com',
                    password: hashedPassword,
                    role: 'admin'
                });
                console.log('Created new admin user shopflow@gmail.com');
            }
        }
        
        console.log('Admin credentials successfully updated!');
    } catch (err) {
        console.error('Error updating admin:', err);
    } finally {
        await mongoose.disconnect();
    }
}

updateAdmin();
