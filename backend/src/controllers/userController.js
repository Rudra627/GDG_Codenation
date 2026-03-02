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

// Get Public Profile of a User
exports.getUserPublicProfile = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch basic user details
        const [users] = await pool.query(
            'SELECT id, name, role, profile_image_url, created_at, is_blocked FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        // Fetch user's submissions (now including difficulty from problems)
        const [submissions] = await pool.query(`
            SELECT s.id, s.problem_id, COALESCE(p.title, 'Practice') as problem_title, p.difficulty,
                   s.language, s.status, s.runtime, s.submitted_at 
            FROM submissions s
            LEFT JOIN problems p ON s.problem_id = p.id
            WHERE s.user_id = ? 
            ORDER BY s.submitted_at DESC
        `, [id]);

        // Get total count of problems in DB grouped by difficulty
        const [totalProblemsQuery] = await pool.query(`
            SELECT difficulty, COUNT(*) as count 
            FROM problems 
            GROUP BY difficulty
        `);
        const totalProblems = { Easy: 0, Medium: 0, Hard: 0, All: 0 };
        totalProblemsQuery.forEach(row => {
            if (row.difficulty in totalProblems) {
                totalProblems[row.difficulty] = row.count;
            }
            totalProblems.All += row.count;
        });

        // Get user's unique solved problems grouped by difficulty
        const [solvedProblemsQuery] = await pool.query(`
            SELECT p.difficulty, COUNT(DISTINCT s.problem_id) as count
            FROM submissions s
            JOIN problems p ON s.problem_id = p.id
            WHERE s.user_id = ? AND s.status = 'Accepted'
            GROUP BY p.difficulty
        `, [id]);
        
        const solvedProblems = { Easy: 0, Medium: 0, Hard: 0, All: 0 };
        solvedProblemsQuery.forEach(row => {
            if (row.difficulty in solvedProblems) {
                solvedProblems[row.difficulty] = row.count;
            }
            solvedProblems.All += row.count;
        });

        // Calculate User's Global Rank
        // Rank = 1 + (Number of users who have solved strictly MORE unique problems than this user)
        const [rankQuery] = await pool.query(`
            SELECT 1 + COUNT(*) as global_rank 
            FROM (
                SELECT user_id, COUNT(DISTINCT problem_id) as solved_count 
                FROM submissions 
                WHERE status = 'Accepted'
                GROUP BY user_id
                HAVING solved_count > ?
            ) as higher_solvers
        `, [solvedProblems.All]);
        
        const globalRank = rankQuery[0].global_rank;

        res.status(200).json({ 
            user, 
            submissions,
            stats: {
                totalProblems,
                solvedProblems,
                globalRank
            }
        });

    } catch (error) {
        console.error("Error fetching user public profile:", error);
        res.status(500).json({ message: 'Server Error fetching user profile' });
    }
};
