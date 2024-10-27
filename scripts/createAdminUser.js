const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function createAdminUser() {
  try {
    await client.connect();
    const database = client.db('your_database_name');
    const admins = database.collection('admins');

    const adminUser = {
      username: 'admin',
      password: 'your_secure_password', // In production, use a hashed password
      walletAddress: '0x...' // Add a default wallet address if needed
    };

    const result = await admins.insertOne(adminUser);
    console.log(`Admin user created with ID: ${result.insertedId}`);
  } finally {
    await client.close();
  }
}

createAdminUser().catch(console.error);
