const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    try {
        const id = 37; // User ID from previous logs
        const pool = mysql.createPool(process.env.DB_URL);
        
        console.log("Fetching basic user details...");
        const [users] = await pool.query(
            'SELECT id, name, role, profile_image_url, created_at, is_blocked FROM users WHERE id = ?',
            [id]
        );
        console.log("Users:", users.length);
        
        console.log("Fetching submissions...");
        const [submissions] = await pool.query(`
            SELECT s.id, s.problem_id, COALESCE(p.title, 'Practice') as problem_title, p.difficulty,
                   s.language, s.status, s.runtime, s.submitted_at 
            FROM submissions s
            LEFT JOIN problems p ON s.problem_id = p.id
            WHERE s.user_id = ? 
            ORDER BY s.submitted_at DESC
        `, [id]);
        console.log("Submissions count:", submissions.length);
        
        console.log("Fetching total problems...");
        const [totalProblemsQuery] = await pool.query(`
            SELECT difficulty, COUNT(*) as count 
            FROM problems 
            GROUP BY difficulty
        `);
        console.log("Total Problems DB:", totalProblemsQuery);
        
        console.log("Fetching solved counts by difficulty...");
        const [solvedProblemsQuery] = await pool.query(`
            SELECT p.difficulty, COUNT(DISTINCT s.problem_id) as count
            FROM submissions s
            JOIN problems p ON s.problem_id = p.id
            WHERE s.user_id = ? AND s.status = 'Accepted'
            GROUP BY p.difficulty
        `, [id]);
        console.log("Solved Problems Query:", solvedProblemsQuery);
        
         const solvedProblems = { Easy: 0, Medium: 0, Hard: 0, All: 0 };
        solvedProblemsQuery.forEach(row => {
            const num = Number(row.count) || 0;
            if (row.difficulty in solvedProblems) {
                 solvedProblems[row.difficulty] = num;
            }
             solvedProblems.All += num;
        });
        console.log("Solved math output:", solvedProblems);
        
        console.log("Fetching rank...");
        const [rankQuery] = await pool.query(`
            SELECT 1 + COUNT(*) as rank 
            FROM (
                SELECT user_id, COUNT(DISTINCT problem_id) as solved_count 
                FROM submissions 
                WHERE status = 'Accepted'
                GROUP BY user_id
                HAVING solved_count > ?
            ) as higher_solvers
        `, [solvedProblems.All]);
        
        console.log("Rank output:", rankQuery[0]);
        console.log("\nALL QUERIES PASSED!");

    } catch (e) {
        console.error("CRASH AT:", e);
    }
    process.exit(0);
}

run();
