const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    try {
        const pool = mysql.createPool(process.env.DB_URL);
        const [rankQuery] = await pool.query(`
            SELECT 1 + COUNT(*) as rank 
            FROM (
                SELECT user_id, COUNT(DISTINCT problem_id) as solved_count 
                FROM submissions 
                WHERE status = 'Accepted'
                GROUP BY user_id
                HAVING solved_count > ?
            ) as higher_solvers
        `, [1]);
        
        console.log('Rank:', rankQuery);

    } catch(e) {
        console.error('DB Error:', e);
    }
    process.exit(0);
}

run();
