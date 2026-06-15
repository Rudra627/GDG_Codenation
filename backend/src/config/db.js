require('dotenv').config();

const isPG = !!process.env.DB_URL;

let pool;

if (isPG) {
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
  });
  const originalQuery = pool.query.bind(pool);
  pool.query = (text, params) => {
    if (params && params.length > 0) {
      let idx = 0;
      text = text.replace(/\?/g, () => `$${++idx}`);
    }
    const upper = text.trim().toUpperCase();
    if (upper.startsWith('INSERT') && !upper.includes('RETURNING') && !upper.includes('ON CONFLICT')) {
      text = text.trimEnd().replace(/;*$/, '') + ' RETURNING id';
    }
    return originalQuery(text, params).then(result => {
      if (upper.startsWith('SELECT') || upper.startsWith('WITH')) {
        return [result.rows, result.fields];
      }
      if (upper.startsWith('INSERT')) {
        return [{ insertId: result.rows?.[0]?.id || 0, affectedRows: result.rowCount }];
      }
      return [{ affectedRows: result.rowCount }];
    });
  };
} else {
  const mysql = require('mysql2/promise');
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'leetcode_clone',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

const helpers = {
  isPG: () => isPG,
  onDuplicate: (cols) => isPG
    ? `ON CONFLICT (${cols}) DO UPDATE SET`
    : 'ON DUPLICATE KEY UPDATE',
  values: (col) => isPG ? `EXCLUDED.${col}` : `VALUES(${col})`,
  now: () => isPG ? 'NOW()' : 'NOW()',
};

module.exports = pool;
module.exports.helpers = helpers;