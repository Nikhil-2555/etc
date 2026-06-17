const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config({ path: './.env' });

async function test() {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Create test user
    const email = 'test_login_123@example.com';
    const password = 'Password123';
    
    await User.deleteOne({ email });
    const user = await User.create({ name: 'Test User', email, password });
    
    console.log('User created. Hashed password:', user.password);
    
    const isMatch = await user.matchPassword(password);
    console.log('Match immediately after creation:', isMatch);
    
    const foundUser = await User.findOne({ email });
    const isMatchFound = await foundUser.matchPassword(password);
    console.log('Match after findOne:', isMatchFound);
    
    await mongoose.disconnect();
}

test().catch(console.error);
