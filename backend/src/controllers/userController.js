const pool = require('../config/db');
const sendEmail = require('../utils/sendEmail');

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        // We only want to return non-sensitive info
        const [users] = await pool.query(
            'SELECT id, name, email, role, profile_image_url, created_at, is_blocked FROM users ORDER BY created_at DESC'
        );
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: 'Server Error fetching users' });
    }
};

// Delete user account
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting Admins to preserve system continuity (problems, etc.)
        const [userCheck] = await pool.query('SELECT role FROM users WHERE id = ?', [id]);
        if (userCheck.length > 0 && userCheck[0].role === 'Admin') {
            return res.status(403).json({ message: 'Cannot delete an Admin account.' });
        }

        // To safely delete a user with many cascading foreign keys (like submissions, contest_participants, etc.)
        // we can temporarily disable foreign key checks for this transaction.
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            await connection.query('SET FOREIGN_KEY_CHECKS = 0');
            
            // Delete all the user's data to avoid orphans, then delete the user
            await connection.query('DELETE FROM contest_participants WHERE user_id = ?', [id]);
            await connection.query('DELETE FROM submissions WHERE user_id = ?', [id]);
            const [result] = await connection.query('DELETE FROM users WHERE id = ?', [id]);
            
            await connection.query('SET FOREIGN_KEY_CHECKS = 1');
            
            await connection.commit();

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (dbError) {
            await connection.query('SET FOREIGN_KEY_CHECKS = 1');
            await connection.rollback();
            throw dbError; // Pass down to main catch
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: 'Server Error deleting user' });
    }
};

// Block/Unblock user account
exports.toggleBlockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_blocked } = req.body;
        
        const [result] = await pool.query('UPDATE users SET is_blocked = ? WHERE id = ?', [is_blocked ? 1 : 0, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: `User ${is_blocked ? 'blocked' : 'unblocked'} successfully` });
    } catch (error) {
        console.error("Error blocking user:", error);
        res.status(500).json({ message: 'Server Error blocking user' });
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
