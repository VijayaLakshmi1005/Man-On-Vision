const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const existingUser = await User.findOne({ email: 'vikas@1234' });
        if (existingUser) {
            console.log('User vikas@1234 already exists. Updating password and role to admin...');
            existingUser.password = await bcrypt.hash('vikas@1234', 10);
            existingUser.role = 'admin';
            await existingUser.save();
            console.log('User updated successfully.');
        } else {
            console.log('Creating new admin user...');
            const hashedPassword = await bcrypt.hash('vikas@1234', 10);
            const user = new User({
                firstName: 'Vikas',
                lastName: 'Admin',
                email: 'vikas@1234',
                password: hashedPassword,
                role: 'admin'
            });
            await user.save();
            console.log('Admin user created successfully.');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
}

createUser();
