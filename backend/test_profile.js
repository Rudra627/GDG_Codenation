const axios = require('axios');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function test() {
    try {
        const pool = mysql.createPool(process.env.DB_URL);
        const [users] = await pool.query(`SELECT * FROM users WHERE email = "anshumandash909@gmail.com" LIMIT 1`);
        if (users.length === 0) { console.log("User not found"); process.exit(1); }
        
        const user = users[0];
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret", { expiresIn: "1d" });
        
        console.log("Fetching local profile...");
        const res = await axios.get("http://localhost:5000/api/users/" + user.id + "/profile", { 
            headers: { Authorization: "Bearer " + token }
        });
        console.log("SUCCESS:", JSON.stringify(res.data.stats, null, 2));
    } catch(e) {
        console.error("API Error Object:", e.response ? e.response.data : e.message);
    }
    process.exit(0);
}
test();
