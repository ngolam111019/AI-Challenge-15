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
    const res = await pool.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants');`);
    if (!res.rows[0].exists) {
      console.log('⚡ Automatic cloud migration: initializing tables from init.sql...');
      const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
      await pool.query(sql);
      console.log('⚡ Database tables initialized successfully.');
      
      const countRes = await pool.query('SELECT COUNT(*) FROM tenants');
      if (Number(countRes.rows[0].count) === 0) {
        console.log('⚡ Automatic cloud migration: seeding initial sample tenants...');
        const seedScript = require('../seed');
        await seedScript.seed(false);
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
