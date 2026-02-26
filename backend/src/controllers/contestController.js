const pool = require('../config/db');
const sendEmail = require('../utils/sendEmail');
// @desc    Get all contests
// @route   GET /api/contests
// @access  Public or User
exports.getContests = async (req, res) => {
    try {
        const [contests] = await pool.query('SELECT * FROM contests ORDER BY start_time DESC');
        res.status(200).json(contests);
    } catch (error) {
        console.error("Error fetching contests:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single contest details
// @route   GET /api/contests/:id
// @access  Public or User
exports.getContestById = async (req, res) => {
    try {
        const [contests] = await pool.query('SELECT * FROM contests WHERE id = ?', [req.params.id]);
        
        if (contests.length === 0) {
            return res.status(404).json({ message: 'Contest not found' });
        }
        
        const contest = contests[0];
        
        // Also fetch problems if the contest has started or if the user is an admin
        let problems = [];
        const now = new Date();
        const startTime = new Date(contest.start_time);
        
        if (now >= startTime || (req.user && req.user.role === 'Admin')) {
            const [problemRows] = await pool.query(`
                SELECT p.id, p.title, p.difficulty, cp.points
                FROM problems p
                JOIN contest_problems cp ON p.id = cp.problem_id
                WHERE cp.contest_id = ?
            `, [contest.id]);
            problems = problemRows;
        }

        res.status(200).json({ ...contest, problems });
    } catch (error) {
        console.error("Error fetching contest:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new contest
// @route   POST /api/contests
// @access  Admin
exports.createContest = async (req, res) => {
    try {
        const { title, description, start_time, end_time, problems } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO contests (title, description, start_time, end_time, created_by) VALUES (?, ?, ?, ?, ?)',
            [title, description, start_time, end_time, req.user.id]
        );
        
        const contestId = result.insertId;
        
        // Add problems if provided
        if (problems && problems.length > 0) {
            for (const prob of problems) {
                await pool.query(
                    'INSERT INTO contest_problems (contest_id, problem_id, points) VALUES (?, ?, ?)',
                    [contestId, prob.id, prob.points || 100]
                );
            }
        }
        
        res.status(201).json({ message: 'Contest created successfully', contestId });
    } catch (error) {
        console.error("Error creating contest:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Join a contest
// @route   POST /api/contests/:id/join
// @access  Private
exports.joinContest = async (req, res) => {
    try {
        const contestId = req.params.id;
        const userId = req.user.id;
        
        const [contests] = await pool.query('SELECT * FROM contests WHERE id = ?', [contestId]);
        if (contests.length === 0) {
            return res.status(404).json({ message: 'Contest not found' });
        }

        // Fetch user info to get the email
        const [users] = await pool.query('SELECT email, name FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = users[0];
        
        // Check if already joined
        const [participants] = await pool.query('SELECT * FROM contest_participants WHERE contest_id = ? AND user_id = ?', [contestId, userId]);
        if (participants.length > 0) {
            return res.status(400).json({ message: 'Already joined this contest' });
        }
        
        await pool.query('INSERT INTO contest_participants (contest_id, user_id) VALUES (?, ?)', [contestId, userId]);
        
        // Send email notification
        try {
            const contestDate = new Date(contests[0].start_time).toLocaleString();
            const contestEndDate = contests[0].end_time ? new Date(contests[0].end_time).toLocaleString() : 'Not specified';
            const message = `Hi ${user.name},\n\nYou have successfully registered for the contest: ${contests[0].title}.\n\nContest starts at: ${contestDate}.\nDeadline/Ends at: ${contestEndDate}.\n\nGood luck!`;
            
            await sendEmail({
                email: user.email,
                subject: `Contest Registration Confirmed: ${contests[0].title}`,
                message,
            });
        } catch (emailError) {
            console.error("Error sending email:", emailError);
            // We still want to return success for joining even if email fails
        }
        
        res.status(200).json({ message: 'Successfully joined the contest' });
    } catch (error) {
        console.error("Error joining contest:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get contest leaderboard
// @route   GET /api/contests/:id/leaderboard
// @access  Public or User
exports.getLeaderboard = async (req, res) => {
    try {
        const contestId = req.params.id;
        const [leaderboard] = await pool.query(`
            SELECT cp.user_id, u.name, cp.score, cp.penalty
            FROM contest_participants cp
            JOIN users u ON cp.user_id = u.id
            WHERE cp.contest_id = ?
            ORDER BY cp.score DESC, cp.penalty ASC
        `, [contestId]);
        
        res.status(200).json(leaderboard);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Send reminder email to all participants of a contest
// @route   POST /api/contests/:id/remind
// @access  Admin
exports.sendContestReminder = async (req, res) => {
    try {
        const contestId = req.params.id;
        
        // 1. Fetch contest details
        const [contests] = await pool.query('SELECT * FROM contests WHERE id = ?', [contestId]);
        if (contests.length === 0) {
            return res.status(404).json({ message: 'Contest not found' });
        }
        const contest = contests[0];

        // 2. Fetch all participants with their emails
        const [participants] = await pool.query(`
            SELECT u.email, u.name 
            FROM contest_participants cp
            JOIN users u ON cp.user_id = u.id
            WHERE cp.contest_id = ?
        `, [contestId]);

        if (participants.length === 0) {
            return res.status(400).json({ message: 'No participants joined this contest yet.' });
        }

        // 3. Send emails
        const contestDate = new Date(contest.start_time).toLocaleString();
        let successCount = 0;
        let failCount = 0;

        for (const user of participants) {
            try {
                const message = `Hi ${user.name},\n\nFriendly reminder: The contest "${contest.title}" is starting soon at ${contestDate}.\n\nGet ready and good luck!\n\nThe Kaamigo Team`;
                await sendEmail({
                    email: user.email,
                    subject: `Reminder: Contest "${contest.title}" Is Starting Soon!`,
                    message,
                });
                successCount++;
            } catch (emailError) {
                console.error(`Failed to send reminder to ${user.email}:`, emailError);
                failCount++;
            }
        }

        res.status(200).json({ 
            message: 'Reminders processed', 
            successCount, 
            failCount,
            totalParticipants: participants.length
        });

    } catch (error) {
        console.error("Error sending reminders:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
