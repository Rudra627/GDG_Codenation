const pool = require('../config/db');
const { executeCode } = require('../services/codeExecutionService');

// Helper to fetch driver code
const getDriverCode = async (problemId, language) => {
    const [rows] = await pool.query(
        'SELECT driver_code FROM problem_templates WHERE problem_id = ? AND language = ?',
        [problemId, language]
    );
    return rows.length > 0 ? rows[0].driver_code : null;
};

// Helper to build final code
const buildFinalCode = (userCode, driverCode, language) => {
    if (!driverCode) return userCode; // fallback to raw
    
    // Inject user code into the placeholder
    return driverCode.replace('{{USER_CODE}}', userCode);
};

// @desc    Run code against sample test cases (no submission saved)
exports.runCode = async (req, res) => {
    try {
        const { problemId, language, code, customInput } = req.body;

        if (!problemId || !language || !code) {
            return res.status(400).json({ message: 'problemId, language, and code are required.' });
        }

        // console.log('--- USER RAN CODE ---');
        // console.log(`Language: ${language}`);
        // // console.log(code);
        // console.log('---------------------');

        let testCasesToRun = [];

        // Distinguish between running samples vs. running a specific custom input string
        if (customInput !== undefined) {
            testCasesToRun = [{ input: customInput, expected_output: '' }];
        } else {
            // Fetch SAMPLE (non-hidden) test cases only
            const [testCases] = await pool.query(
                'SELECT * FROM test_cases WHERE problem_id = ? AND is_hidden = FALSE',
                [problemId]
            );

            if (testCases.length === 0) {
                return res.status(400).json({ message: 'No sample test cases found. Please use Custom Input to test your code.' });
            }
            testCasesToRun = testCases;
        }

        const driverCode = await getDriverCode(problemId, language);
        const finalCode = buildFinalCode(code, driverCode, language);

        const result = await executeCode(language, problemId, finalCode, testCasesToRun);

        res.status(200).json({
            status:             result.status,
            passed:             result.passed,
            total:              result.total,
            runtime:            result.runtime || 0,
            compileError:       result.compileError || null,
            runtimeError:       result.runtimeError || null,
            actualOutput:       result.actualOutput || null,
            expectedOutput:     result.expectedOutput || null,
            failedTestCaseInput: result.failedTestCase ? result.failedTestCase.input : null,
        });

    } catch (error) {
        console.error('[runCode Error]', error);
        res.status(500).json({
            message: 'Server Error during code execution',
            details: error.message || error.toString()
        });
    }
};

// @desc    Submit code for a problem (saves result to DB)
exports.submitCode = async (req, res) => {
    try {
        const { problemId, language, code, contestId } = req.body;
        const userId = req.user.id;

        if (!problemId || !language || !code) {
            return res.status(400).json({ message: 'problemId, language, and code are required.' });
        }

        // Fetch ALL test cases (including hidden)
        const [testCases] = await pool.query(
            'SELECT * FROM test_cases WHERE problem_id = ?',
            [problemId]
        );

        if (testCases.length === 0) {
            return res.status(400).json({ message: 'No test cases found for this problem. Please contact the administrator.' });
        }

        // Execute code
        const driverCode = await getDriverCode(problemId, language);
        const finalCode = buildFinalCode(code, driverCode, language);
        const execResult = await executeCode(language, problemId, finalCode, testCases);

        const status  = execResult.status;
        const runtime = execResult.runtime || 0;

        // Save submission to DB
        const [insertResult] = await pool.query(
            'INSERT INTO submissions (user_id, problem_id, language, code, status, runtime, contest_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, problemId, language, code, status, runtime, contestId || null]
        );

        // Update contest score if applicable
        if (contestId && status === 'Accepted') {
            const [prevSuccess] = await pool.query(
                "SELECT * FROM submissions WHERE user_id = ? AND problem_id = ? AND contest_id = ? AND status = 'Accepted' AND id != ?",
                [userId, problemId, contestId, insertResult.insertId]
            );

            if (prevSuccess.length === 0) {
                const [cpRows] = await pool.query(
                    'SELECT points FROM contest_problems WHERE contest_id = ? AND problem_id = ?',
                    [contestId, problemId]
                );
                const points = cpRows.length > 0 ? cpRows[0].points : 100;

                const [contests] = await pool.query('SELECT start_time FROM contests WHERE id = ?', [contestId]);
                let penalty = 0;
                if (contests.length > 0) {
                    const startTime = new Date(contests[0].start_time);
                    penalty = Math.floor((new Date() - startTime) / 60000);
                }

                await pool.query(
                    'UPDATE contest_participants SET score = score + ?, penalty = penalty + ? WHERE contest_id = ? AND user_id = ?',
                    [points, penalty, contestId, userId]
                );
            }
        }

        res.status(201).json({
            message:        'Code submitted successfully',
            submissionId:   insertResult.insertId,
            status,
            runtime,
            passed:         execResult.passed,
            total:          execResult.total,
            compileError:   execResult.compileError || null,
            runtimeError:   execResult.runtimeError || null,
            actualOutput:   execResult.actualOutput || null,
            expectedOutput: execResult.expectedOutput || null,
        });

    } catch (error) {
        console.error('[submitCode Error]', error);
        res.status(500).json({
            message: 'Server Error during submission',
            details: error.message || error.toString()
        });
    }
};

// @desc    Get user's submission history
exports.getUserSubmissions = async (req, res) => {
    try {
        const userId = req.user.id;
        const [submissions] = await pool.query(`
            SELECT s.id, s.problem_id, COALESCE(p.title, 'Practice') as problem_title,
                   s.language, s.status, s.runtime, s.submitted_at 
            FROM submissions s
            LEFT JOIN problems p ON s.problem_id = p.id
            WHERE s.user_id = ? 
            ORDER BY s.submitted_at DESC
        `, [userId]);

        res.status(200).json(submissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all submissions (Admin)
exports.getAllSubmissions = async (req, res) => {
    try {
        const [submissions] = await pool.query(`
            SELECT s.id, s.user_id, u.name as user_name, p.title as problem_title, s.language, s.code, s.status, s.runtime, s.submitted_at 
            FROM submissions s
            JOIN users u ON s.user_id = u.id
            JOIN problems p ON s.problem_id = p.id
            ORDER BY s.submitted_at DESC
        `);

        res.status(200).json(submissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update submission status manually (Admin)
exports.updateSubmissionStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const submissionId = req.params.id;

        await pool.query('UPDATE submissions SET status = ? WHERE id = ?', [status, submissionId]);

        res.status(200).json({ message: 'Status updated successfully', status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete all submissions (Admin)
exports.deleteAllSubmissions = async (req, res) => {
    try {
        await pool.query('DELETE FROM submissions');
        res.status(200).json({ message: 'All submissions cleared successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error clearing submissions' });
    }
};
