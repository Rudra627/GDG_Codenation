const pool = require('./config/db');

async function migrate() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS problem_templates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                problem_id INT NOT NULL,
                language VARCHAR(20) NOT NULL,
                starter_code TEXT NOT NULL,
                driver_code TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_problem_lang (problem_id, language),
                FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ problem_templates table created (or already exists)');
        process.exit(0);
    } catch (e) {
        console.error('❌ Migration failed:', e.message);
        process.exit(1);
    }
}

migrate();
