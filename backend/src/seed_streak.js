/**
 * seed_streak.js
 * Inserts one "Accepted" submission per day for the last 365 days
 * for user ID 28 (dashanshuman444@gmail.com / Ansuman Dash)
 * Run: node seed_streak.js
 */

const pool = require('./config/db');

const TARGET_USER_ID = 15;

async function seedStreak() {
    try {
        // 1. Confirm user exists
        const [users] = await pool.query('SELECT id, email, name FROM users WHERE id = ?', [TARGET_USER_ID]);
        if (users.length === 0) {
            console.error(`❌ User ID ${TARGET_USER_ID} not found.`);
            process.exit(1);
        }
        console.log(`✅ Targeting user: ${users[0].name} <${users[0].email}>`);

        // 2. Find a valid problem to link the submissions to
        const [problems] = await pool.query('SELECT id FROM problems LIMIT 1');
        if (problems.length === 0) {
            console.error('❌ No problems found in DB.');
            process.exit(1);
        }
        const problemId = problems[0].id;
        console.log(`✅ Using problem ID: ${problemId}`);

        // 3. Get existing submission days to skip duplicates
        const [existing] = await pool.query(
            'SELECT DATE(submitted_at) as day FROM submissions WHERE user_id = ? GROUP BY DATE(submitted_at)',
            [TARGET_USER_ID]
        );
        const existingDays = new Set(existing.map(r => {
            const d = new Date(r.day);
            return d.toISOString().split('T')[0];
        }));
        console.log(`ℹ️  Already has submissions on ${existingDays.size} days — skipping those.`);

        // 4. Insert one "Accepted" submission per day for past 365 days
        const now = new Date();
        let inserted = 0;

        for (let i = 0; i < 365; i++) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            date.setHours(12, 0, 0, 0);

            const dayKey = date.toISOString().split('T')[0];
            if (existingDays.has(dayKey)) continue;

            await pool.query(
                `INSERT INTO submissions (user_id, problem_id, language, code, status, runtime, submitted_at)
                 VALUES (?, ?, 'python', '# streak seed', 'Accepted', 0.1, ?)`,
                [TARGET_USER_ID, problemId, date]
            );
            inserted++;
        }

        console.log(`\n🎉 Done! Inserted ${inserted} submissions.`);
        console.log(`✅ Full 365-day streak activated for ${users[0].name}!`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

seedStreak();
