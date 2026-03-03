const axios = require('axios');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    try {
        console.log("Setting up DB connection...");
        const pool = mysql.createPool(process.env.DB_URL);
        
        // Find an admin user to get token
        const [users] = await pool.query("SELECT * FROM users WHERE role = 'Admin' LIMIT 1");
        if (users.length === 0) {
            console.error("No admin users found for testing.");
            process.exit(1);
        }
        
        let token;
        try {
            // we don't have password, so just generate a token using jsonwebtoken
            const jwt = require('jsonwebtoken');
            token = jwt.sign({ id: users[0].id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        } catch(e) {
            console.error("Failed to sign JWT", e);
            process.exit(1);
        }

        console.log("Admin token generated for user:", users[0].email);

        // 1. Submit to a problem WITHOUT test cases (ID 20)
        console.log("\n--- Testing submission to unconfigured problem (ID 20) ---");
        try {
            await axios.post('http://localhost:5000/api/submissions', {
                problemId: 20,
                language: 'javascript',
                code: 'console.log("Hello");'
            }, { headers: { Authorization: `Bearer ${token}` } });
            console.log("❌ FAIL: Submission succeeded unexpectedly.");
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log("✅ PASS: Server correctly rejected submission with 400 error.");
                console.log("Response:", error.response.data.message);
            } else {
                console.log("❌ FAIL: Unexpected error:", error.message);
            }
        }

        // 2. Submit to Sqrt(x) WITH test cases (ID 22)
        console.log("\n--- Testing submission to Sqrt(x) (ID 22) ---");
        try {
            const res = await axios.post('http://localhost:5000/api/submissions', {
                problemId: 22,
                language: 'javascript',
                code: 'function mySqrt(x) { return Math.floor(Math.sqrt(x)); }\nconsole.log(mySqrt(parseInt(require("fs").readFileSync(0, "utf-8"))));'
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            console.log("✅ PASS: Submission succeeded.");
            console.log("Response status:", res.data.status);
            console.log("Output:", res.data);
            
            if (res.data.status === 'Accepted') {
                 console.log("✅ PASS: Solution was Accepted.");
            } else {
                 console.log("❌ FAIL: Solution was not Accepted. Status:", res.data.status);
            }
        } catch (error) {
            console.log("❌ FAIL: Server rejected submission:", error.message);
            if(error.response) console.log(error.response.data);
        }

    } catch (e) {
        console.error("Test script failed:", e);
    }
    process.exit(0);
}
run();
