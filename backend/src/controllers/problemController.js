const pool = require('../config/db');

// @desc    Create a problem (Admin)
exports.createProblem = async (req, res) => {
    try {
        const { title, description, difficulty, topics } = req.body;
        const [result] = await pool.query(
            'INSERT INTO problems (title, description, difficulty, topics, created_by) VALUES (?, ?, ?, ?, ?)',
            [title, description, difficulty, topics || '', req.user.id]
        );
        res.status(201).json({ message: 'Problem created successfully', problemId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


// @desc    Get all problems (User/Admin)
exports.getProblems = async (req, res) => {
    try {
        const [problems] = await pool.query('SELECT id, title, description, difficulty, created_at, is_daily FROM problems');
        res.status(200).json(problems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single problem by ID (User/Admin)
exports.getProblemById = async (req, res) => {
    try {
        const { id } = req.params;
        const [problems] = await pool.query('SELECT * FROM problems WHERE id = ?', [id]);
        if (problems.length === 0) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        res.status(200).json(problems[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a problem (Admin)
exports.updateProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, difficulty, topics } = req.body;
        
        const [result] = await pool.query(
            'UPDATE problems SET title = ?, description = ?, difficulty = ?, topics = ? WHERE id = ?',
            [title, description, difficulty, topics || '', id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        res.status(200).json({ message: 'Problem updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a problem (Admin)
exports.deleteProblem = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Delete related test cases to satisfy foreign key constraints
        await pool.query('DELETE FROM test_cases WHERE problem_id = ?', [id]);
        
        // Delete related submissions to satisfy foreign key constraints
        await pool.query('DELETE FROM submissions WHERE problem_id = ?', [id]);
        
        const [result] = await pool.query('DELETE FROM problems WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        res.status(200).json({ message: 'Problem deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error during problem deletion' });
    }
};

// @desc    Add Test Case (Admin)
exports.addTestCase = async (req, res) => {
    try {
        const { id } = req.params; // problem id
        const { input, expected_output, is_hidden } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO test_cases (problem_id, input, expected_output, is_hidden) VALUES (?, ?, ?, ?)',
            [id, input, expected_output, is_hidden || false]
        );
        res.status(201).json({ message: 'Test case added successfully', testCaseId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Test Cases for a Problem (Admin/System)
exports.getTestCases = async (req, res) => {
    try {
        const { id } = req.params; // problem id
        const [testCases] = await pool.query('SELECT * FROM test_cases WHERE problem_id = ?', [id]);
        res.status(200).json(testCases);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get only visible (non-hidden) sample test cases (User)
exports.getSampleTestCases = async (req, res) => {
    try {
        const { id } = req.params;
        const [testCases] = await pool.query(
            'SELECT id, input, expected_output, is_hidden FROM test_cases WHERE problem_id = ?',
            [id]
        );
        res.status(200).json(testCases);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Set a problem as Daily Challenge (Admin)
exports.setDailyChallenge = async (req, res) => {
    try {
        const { id } = req.params; // problem id
        
        // 1. Reset all problems to false
        await pool.query('UPDATE problems SET is_daily = FALSE');
        
        // 2. Set the requested problem to true
        const [result] = await pool.query('UPDATE problems SET is_daily = TRUE WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        
        res.status(200).json({ message: 'Daily challenge updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error updating daily challenge' });
    }
};

// @desc    Get all problems with user solved status
exports.getProblemsWithUserStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [problems] = await pool.query(`
            SELECT 
                p.id, p.title, p.difficulty, p.topics, p.is_daily, p.created_at,
                (SELECT COUNT(*) FROM submissions s WHERE s.problem_id = p.id AND s.user_id = ? AND s.status = 'Accepted') as solved_count
            FROM problems p
            ORDER BY p.is_daily DESC, p.created_at DESC
        `, [userId]);
        
        const problemsWithStatus = problems.map(p => ({
            ...p,
            is_solved: p.solved_count > 0,
            is_daily: !!p.is_daily
        }));

        res.status(200).json(problemsWithStatus);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching problems' });
    }
};
