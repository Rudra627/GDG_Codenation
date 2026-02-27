const pool = require('../config/db');
const sendEmail = require('../utils/sendEmail');

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        // We only want to return non-sensitive info
        const [users] = await pool.query(
            'SELECT id, name, email, role, profile_image_url, created_at FROM users ORDER BY created_at DESC'
        );
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: 'Server Error fetching users' });
    }
};

// Send email reminders to users (Admin only)
exports.sendReminders = async (req, res) => {
    try {
        const { userIds, subject, message } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ message: 'Subject and message are required.' });
        }

        let emailsToTarget = [];

        if (userIds === 'all') {
            // Get all user emails
            const [users] = await pool.query('SELECT email FROM users');
            emailsToTarget = users.map(u => u.email);
        } else if (Array.isArray(userIds) && userIds.length > 0) {
            // Get emails for specific user IDs
             // Create a string of placeholders for the IN clause like (?, ?, ?)
            const placeholders = userIds.map(() => '?').join(',');
            const [users] = await pool.query(
                `SELECT email FROM users WHERE id IN (${placeholders})`,
                userIds
            );
            emailsToTarget = users.map(u => u.email);
        } else {
            return res.status(400).json({ message: 'Invalid or missing user selection.' });
        }

        if (emailsToTarget.length === 0) {
            return res.status(404).json({ message: 'No valid user emails found for selection.' });
        }

        // Send emails
        let successCount = 0;
        let failCount = 0;

        for (const email of emailsToTarget) {
            try {
                await sendEmail({
                    email,
                    subject,
                    message
                });
                successCount++;
            } catch (err) {
                console.error(`Failed to send email to ${email}:`, err);
                failCount++;
            }
        }

        res.status(200).json({ 
            message: `Sent reminders successfully to ${successCount} users. Failed for ${failCount} users.`,
            successCount,
            failCount
        });

    } catch (error) {
        console.error("Error sending reminders:", error);
        res.status(500).json({ message: 'Server Error sending reminders' });
    }
};
