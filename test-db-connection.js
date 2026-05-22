// test-db-connection.js
// Ensure you have a .env in the root, and pg installed locally or globally
require('dotenv').config({ path: './.env' }); // This is for the standalone script only

const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Successfully connected to Neon database!');
    const res = await client.query('SELECT NOW() as current_time');
    console.log('Current time from DB:', res.rows[0].current_time);
    await client.end();
    console.log('Connection closed.');
  } catch (err) {
    console.error('Failed to connect to Neon database:', err);
    // Log the full error object for more details
    console.error(JSON.stringify(err, null, 2));
  }
}

testConnection();