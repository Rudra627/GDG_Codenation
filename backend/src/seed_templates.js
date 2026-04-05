const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });
const { autoGenerateTemplates } = require('./controllers/templateController');

// Define known signatures for existing problems
// If a problem isn't here, it will just be standard IO.
const PROBLEM_SIGNATURES = {
    // Two Sum
    1: { fnName: 'twoSum', params: 'nums: List[int], target: int', returnType: 'List[int]' },
    // Palindrome Number
    2: { fnName: 'isPalindrome', params: 'x: int', returnType: 'bool' },
    // Roman to Integer
    3: { fnName: 'romanToInt', params: 's: str', returnType: 'int' },
    // Valid Parentheses
    4: { fnName: 'isValid', params: 's: str', returnType: 'bool' },
    // Merge Two Sorted Lists (simplifying to arrays for IO since linked lists IO is complex, or skip if it requires structs)
    5: null, // Let's skip complex linked list parsing for now and leave it as standard IO
    // Remove Duplicates
    6: { fnName: 'removeDuplicates', params: 'nums: List[int]', returnType: 'int' },
    // Search Insert Position
    8: { fnName: 'searchInsert', params: 'nums: List[int], target: int', returnType: 'int' },
    // Length of Last Word
    9: { fnName: 'lengthOfLastWord', params: 's: str', returnType: 'int' },
    // Plus One
    10: { fnName: 'plusOne', params: 'digits: List[int]', returnType: 'List[int]' },
    // Add Binary
    11: { fnName: 'addBinary', params: 'a: str, b: str', returnType: 'str' },
    // Sqrt(x)
    12: { fnName: 'mySqrt', params: 'x: int', returnType: 'int' },
    // Check if Number config
    13: { fnName: 'isPrime', params: 'n: int', returnType: 'bool' },
    // problem 23 that user just ran
    23: { fnName: 'solve', params: 'a: int, b: int', returnType: 'int' }
};

async function seed() {
    console.log('Connecting to database...');
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log('Creating table if not exists...');
        await pool.query('DROP TABLE IF EXISTS problem_templates');
        await pool.query(`
            CREATE TABLE problem_templates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                problem_id INT NOT NULL,
                language VARCHAR(50) NOT NULL,
                starter_code TEXT,
                driver_code TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
                UNIQUE KEY idx_problem_lang (problem_id, language)
            )
        `);

        const [problems] = await pool.query('SELECT id, title FROM problems');
        console.log(`Found ${problems.length} problems.`);

        for (const p of problems) {
            const sig = PROBLEM_SIGNATURES[p.id];
            if (sig) {
                console.log(`Generating templates for Problem ${p.id}: ${p.title} (${sig.fnName})`);
                try {
                    await pool.query('DELETE FROM problem_templates WHERE problem_id = ?', [p.id]);
                    await autoGenerateTemplates(p.id, sig.fnName, sig.params, sig.returnType);
                    console.log(`   - Success`);
                } catch (e) {
                    console.error(`   - Failed: ${e.message}`);
                }
            } else {
                console.log(`Skipping Problem ${p.id}: ${p.title} (No signature defined, staying Standard IO)`);
            }
        }
        console.log('Done planting templates!');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

seed();
