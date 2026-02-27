const bcrypt = require('bcrypt');
const pool = require('./config/db');

const newAdmins = [
    { name: 'Admin2', email: 'pratyushnanda77@gmail.com', password: 'pratyush@codenation', role: 'Admin' },
    { name: 'ayushmantripathy', email: '23cse417.ayushmantripathy@giet.edu', password: 'ayushmantripathy@codenation', role: 'Admin' },
   
];

async function seedAdmins() {
    try {
        console.log("Starting admin seed...");

        for (const admin of newAdmins) {
            // Check if admin already exists
            const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [admin.email]);
            if (existing.length > 0) {
                console.log(`Admin '${admin.email}' already exists. Skipping.`);
                continue;
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(admin.password, salt);

            // Insert new admin
            const [result] = await pool.query(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [admin.name, admin.email, hashedPassword, admin.role]
            );

            console.log(`Inserted admin: ${admin.name} (${admin.email})`);
        }

        console.log("All admins seeded successfully!");

    } catch (error) {
        console.error("Failed to seed admins:", error);
    } finally {
        process.exit(0);
    }
}

seedAdmins();
