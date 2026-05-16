const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
};

if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1')) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

async function initDatabase() {
  try {
    console.log('⚡ Automatic cloud migration: ensuring schema and tables from init.sql...');
    const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    await pool.query(sql);
    console.log('⚡ Database schema verified successfully.');
    
    if (process.env.SEEDING_IN_PROGRESS !== 'true') {
      const countRes = await pool.query('SELECT COUNT(*) FROM tenants');
      if (Number(countRes.rows[0].count) === 0) {
        console.log('⚡ Automatic cloud migration: seeding initial sample tenants...');
        process.env.SEEDING_IN_PROGRESS = 'true';
        const seedScript = require('../seed');
        await seedScript.seed(false, pool);
      }
    }
  } catch (err) {
    console.error('Database auto-init warning:', err.message);
  }
}

initDatabase();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
