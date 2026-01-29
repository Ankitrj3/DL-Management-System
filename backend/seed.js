require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Admin emails (these will have admin access)
const admins = [
    { email: 'tech.smani@gmail.com', name: 'Tech Smani' },
    { email: 'ankitrobinranjan@gmail.com', name: 'Ankit Ranjan' }
];

// Student emails (add your approved student emails here)
const students = [
    // Add student emails here, or upload via CSV later
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing users
        await User.deleteMany({});
        console.log('Cleared existing users');

        // Create admins
        for (const admin of admins) {
            await User.create({
                email: admin.email.toLowerCase(),
                name: admin.name,
                role: 'admin',
                isApproved: true,
                isBlocked: false
            });
            console.log(`Created admin: ${admin.email}`);
        }

        // Create students
        for (const student of students) {
            await User.create({
                email: student.email.toLowerCase(),
                name: student.name || student.email.split('@')[0],
                role: 'student',
                isApproved: true,
                isBlocked: false
            });
            console.log(`Created student: ${student.email}`);
        }

        console.log('\n=== Database seeded successfully! ===');
        console.log('\n--- Admin Emails ---');
        admins.forEach(a => console.log(`Email: ${a.email}`));
        console.log('\n--- Student Emails ---');
        if (students.length === 0) {
            console.log('No students added. Use admin dashboard to upload CSV or add users.');
        } else {
            students.forEach(s => console.log(`Email: ${s.email}`));
        }

        console.log('\n📝 Note: Users will login with Google Sign-in using these email addresses.');
        console.log('📝 Add more users via the admin dashboard by uploading a CSV file.');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
