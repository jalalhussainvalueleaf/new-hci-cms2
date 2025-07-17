const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = 'mongodb+srv://doadmin:024tm3OX69c8jR5C@db-mongodb-blr1-58622-d48a35ec.mongo.ondigitalocean.com/wp-database-hci?tls=true&authSource=admin';

async function seedAdmin() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('wp-database-hci');
    
    // Check if admin user already exists
    const existingAdmin = await db.collection('users').findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = {
      name: 'Administrator',
      email: 'admin@example.com',
      username: 'admin',
      password: hashedPassword,
      role: 'administrator',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      bio: 'System Administrator',
      website: '',
      avatar: null
    };
    
    await db.collection('users').insertOne(adminUser);
    console.log('Admin user created successfully');
    console.log('Username: admin');
    console.log('Password: admin123');
    
    // Create some sample categories
    const categories = [
      { name: 'Technology', slug: 'technology', description: 'Tech-related posts' },
      { name: 'Development', slug: 'development', description: 'Development tutorials' },
      { name: 'Design', slug: 'design', description: 'Design articles' },
      { name: 'Business', slug: 'business', description: 'Business content' }
    ];
    
    await db.collection('categories').insertMany(categories.map(cat => ({
      ...cat,
      createdAt: new Date(),
      updatedAt: new Date(),
      count: 0
    })));
    
    console.log('Sample categories created');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedAdmin();