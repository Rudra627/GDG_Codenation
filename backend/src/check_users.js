const pool = require('./config/db');
async function check() {
    const [users] = await pool.query('SELECT id, email, name, role FROM users');
    console.log('Users:', JSON.stringify(users, null, 2));
    process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });
