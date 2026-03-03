const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    try {
        const pool = mysql.createPool(process.env.DB_URL);
        
        // Check if test cases already exist to avoid duplicates
        const [existing] = await pool.query('SELECT * FROM test_cases WHERE problem_id = 22');
        if (existing.length === 0) {
            await pool.query(`
                INSERT INTO test_cases (problem_id, input, expected_output, is_hidden)
                VALUES 
                (22, '4', '2', FALSE),
                (22, '8', '2', FALSE),
                (22, '16', '4', TRUE),
                (22, '2147395599', '46339', TRUE)
            `);
            console.log("Inserted test cases for problem 22 (Sqrt(x)).");
        } else {
            console.log("Test cases for problem 22 already exist.");
        }
    } catch(e) {
        console.error("Error inserting test cases:", e);
    }
    process.exit(0);
}

run();
