const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const sendEmail = require('../utils/sendEmail');
// Register a new user
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user exists
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists with this email.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user (default role 'User')
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        // Send Welcome Email
        try {
            await sendEmail({
                email,
                subject: 'Welcome to Kaamigo!',
                message: `Hi ${name},\n\nWelcome to Kaamigo! We are thrilled to have you on board. Get ready to explore contests, solve problems, and climb the leaderboard.\n\nHappy Coding!\nThe Kaamigo Team`
            });
        } catch (emailError) {
            console.error("Error sending welcome email:", emailError);
            // Registration still successful even if email fails
        }

        res.status(201).json({ message: 'User registered successfully!', userId: result.insertId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const user = users[0];

        // Validate password
        const isMatch = user.password ? await bcrypt.compare(password, user.password) : false;
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Create JWT Payload
        const payload = {
            id: user.id,
            role: user.role
        };

        // Sign token
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get Current User Info
exports.me = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, name, email, role, profile_image_url, created_at FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(users[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;   
        
        // The uploaded file is available at req.file
        const file_url = req.file ? `/uploads/profiles/${req.file.filename}` : null;

        // Simple validation
        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Name cannot be empty' });
        }

        if (file_url) {
            // Update both name and image
            await pool.query(
                'UPDATE users SET name = ?, profile_image_url = ? WHERE id = ?',
                [name, file_url, userId]
            );
        } else {
             // Just update the name, preserve existing image
             await pool.query(
                'UPDATE users SET name = ? WHERE id = ?',
                [name, userId]
            );
        }

        // Fetch updated user to return
        const [updatedUsers] = await pool.query(
            'SELECT id, name, email, role, profile_image_url, created_at FROM users WHERE id = ?',
            [userId]
        );

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUsers[0]
        });

    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Google Auth
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    exports.googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;
        
        if (!credential) {
            return res.status(400).json({ message: 'No credential provided from Google' });
        }
        
        console.log("Validating Google Auth. Backend Client ID:", process.env.GOOGLE_CLIENT_ID);

        // 1. Verify token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        if (!payload) {
             return res.status(400).json({ message: 'Invalid Google Token payload' });
        }
        
        const { email, name, picture } = payload;
        
        // 2. Check if user exists
        let user;
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            // Create user
            const [result] = await pool.query(
                'INSERT INTO users (name, email, password, profile_image_url) VALUES (?, ?, ?, ?)',
                [name, email, null, picture] // Null password for OAuth users
            );
            user = { id: result.insertId, name, email, role: 'User', profile_image_url: picture };
            
            // Send Welcome Email for new Google Auth users
            try {
                await sendEmail({
                    email,
                    subject: 'Welcome to Kaamigo!',
                    message: `Hi ${name},\n\nWelcome to Kaamigo! We are thrilled to have you on board via Google Sign-In. Get ready to explore contests, solve problems, and climb the leaderboard.\n\nHappy Coding!\nThe Kaamigo Team`
                });
            } catch (emailError) {
                console.error("Error sending welcome email (Google Auth):", emailError);
            }
        } else {
            user = users[0];
            // Optionally, update their profile picture if they login with Google again and it's missing/changed
            if (picture && user.profile_image_url !== picture) {
                 await pool.query(
                     'UPDATE users SET profile_image_url = ? WHERE id = ?',
                     [picture, user.id]
                 );
                 user.profile_image_url = picture;
            }
        }
        
        // 3. Generate internal JWT
        const jwtPayload = {
            id: user.id,
            role: user.role
        };
        const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        res.status(200).json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile_image_url: user.profile_image_url
            }
        });
    } catch (error) {
        console.error("Google Auth Error:", error.message || error);
        res.status(500).json({ message: 'Google Auth Failed', details: error.message });
    }
};
