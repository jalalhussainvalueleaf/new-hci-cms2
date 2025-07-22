const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('Error: MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  console.log('Using MongoDB URI:', uri.replace(/:([^:]+)@/, ':***@'));
  
  const client = new MongoClient(uri, { 
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000
  });

  try {
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    const db = client.db('wp-database-hci');
    console.log('\nDatabase stats:');
    console.log(await db.stats());
    
    console.log('\nCollections:');
    const collections = await db.listCollections().toArray();
    console.log(collections.map(c => c.name));
    
    if (collections.some(c => c.name === 'users')) {
      const userCount = await db.collection('users').countDocuments();
      console.log(`\nFound ${userCount} users in the database.`);
    } else {
      console.log('\n⚠️  Users collection not found!');
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error details:', {
      name: error.name,
      code: error.code,
      codeName: error.codeName,
      errorLabels: error.errorLabels,
      stack: error.stack
    });
  } finally {
    await client.close();
  }
}

testConnection();
