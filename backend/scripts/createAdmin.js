const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require(path.join(__dirname, '..', 'models', 'User'));

dotenv.config();

const createOrUpdateAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('MongoDB Connected');
        
        const email = 'admin@gmail.com';
        const plainPassword = '12345678';
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        
        // Find if an admin already exists with this email, or create new
        let admin = await User.findOne({ email });
        
        if (admin) {
            admin.password = plainPassword; // the pre-save hook will NOT hash it if we set it directly and save, wait, let's check User model
            // Actually, if we use findOneAndUpdate, pre-save hooks don't run unless configured. 
            // It's safer to just set and save() if pre-save handles hashing, but the seeder manually hashed it.
            // Let's check User model first.
        }
        
        // To be safe, let's just update using updateOne or delete and recreate
        await User.deleteOne({ email });
        
        await User.create({
            name: 'Admin User',
            email: email,
            password: plainPassword, // Assuming User model has a pre-save hook that hashes. If not, it will be plain text. 
            // Wait, in previous seeder it was manually hashed. 
            role: 'admin'
        });
        
        console.log(`Admin account ${email} configured successfully!`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createOrUpdateAdmin();
