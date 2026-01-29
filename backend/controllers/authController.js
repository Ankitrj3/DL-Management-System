const jwt = require('jsonwebtoken');
const User = require('../models/User');
const admin = require('../config/firebase');
const { parse } = require('csv-parse/sync');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Firebase Google Sign-in authentication
exports.firebaseAuth = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ message: 'ID token is required' });
        }

        let decodedToken;
        let email, name, picture, uid;

        // Verify Firebase token
        if (admin.apps.length) {
            try {
                decodedToken = await admin.auth().verifyIdToken(idToken);
                email = decodedToken.email;
                name = decodedToken.name;
                picture = decodedToken.picture;
                uid = decodedToken.uid;
            } catch (firebaseError) {
                console.error('Firebase token verification failed:', firebaseError);
                return res.status(401).json({ message: 'Invalid authentication token' });
            }
        } else {
            // Development mode - decode without verification
            const parts = idToken.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                email = payload.email;
                name = payload.name;
                picture = payload.picture;
                uid = payload.sub || payload.user_id;
            } else {
                return res.status(401).json({ message: 'Invalid token format' });
            }
        }

        if (!email) {
            return res.status(400).json({ message: 'Email not found in token' });
        }

        // Check if user exists and is approved
        let user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(403).json({
                message: 'Your email is not registered. Please contact admin to get access.',
                email
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                message: 'Your account has been blocked. Contact admin.',
                email
            });
        }

        // Update user info from Google
        user.name = name || user.name;
        user.photoURL = picture || user.photoURL;
        user.firebaseUid = uid;
        user.lastLogin = new Date();
        await user.save();

        res.json({
            _id: user._id,
            email: user.email,
            name: user.name,
            photoURL: user.photoURL,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Firebase auth error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get all students
exports.getStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).sort({ createdAt: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Add single user
exports.addUser = async (req, res) => {
    try {
        const { email, name, role = 'student' } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            if (existingUser.isBlocked) {
                existingUser.isBlocked = false;
                await existingUser.save();
                return res.json({ message: 'User reactivated', user: existingUser });
            }
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            email: email.toLowerCase(),
            name: name || email.split('@')[0],
            role
        });

        res.status(201).json({ message: 'User added successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Upload users from CSV
exports.uploadUsers = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'CSV file is required' });
        }

        const csvContent = req.file.buffer.toString();
        const records = parse(csvContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        const results = { added: 0, skipped: 0, reactivated: 0, errors: [] };

        for (const record of records) {
            const email = (record.email || record.Email || record.EMAIL || '').toLowerCase().trim();
            const name = record.name || record.Name || record.NAME || '';

            if (!email || !email.includes('@')) {
                results.errors.push(`Invalid email: ${email}`);
                continue;
            }

            try {
                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    if (existingUser.isBlocked) {
                        existingUser.isBlocked = false;
                        await existingUser.save();
                        results.reactivated++;
                    } else {
                        results.skipped++;
                    }
                } else {
                    await User.create({
                        email,
                        name: name || email.split('@')[0],
                        role: 'student'
                    });
                    results.added++;
                }
            } catch (err) {
                results.errors.push(`Error processing ${email}: ${err.message}`);
            }
        }

        res.json({
            message: `Processed ${records.length} records`,
            results
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Block/Unblock user
exports.toggleBlock = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Cannot block admin users' });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({
            message: user.isBlocked ? 'User blocked' : 'User unblocked',
            user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Delete user
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Cannot delete admin users' });
        }

        await User.findByIdAndDelete(userId);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
