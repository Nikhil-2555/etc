const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './.env' });

async function test() {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const email = 'test_login_123@example.com';
    const user = await User.findOne({ email });
    
    console.log('Original hash:', user.password);
    
    // Simulate updating profile but NOT changing password
    user.name = 'Updated Name';
    await user.save();
    
    console.log('Hash after save without password change:', user.password);
    
    const isMatch = await user.matchPassword('Password123');
    console.log('Match after save without password change:', isMatch);
    
    await mongoose.disconnect();
}

test().catch(console.error);
