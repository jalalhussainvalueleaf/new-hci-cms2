require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

const defaultDoctorCategories = [
  {
    name: 'Cardiac Sciences',
    slug: 'cardiac-sciences',
    description: 'Heart and cardiovascular specialists',
    icon: 'heart',
    color: '#EF4444',
    isActive: true,
    order: 1,
    doctorCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Oncology',
    slug: 'oncology',
    description: 'Cancer treatment and care specialists',
    icon: 'shield',
    color: '#8B5CF6',
    isActive: true,
    order: 2,
    doctorCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Neuro Sciences',
    slug: 'neuro-sciences',
    description: 'Brain and nervous system specialists',
    icon: 'brain',
    color: '#3B82F6',
    isActive: true,
    order: 3,
    doctorCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Gastroenterology',
    slug: 'gastroenterology',
    description: 'Digestive system specialists',
    icon: 'stomach',
    color: '#10B981',
    isActive: true,
    order: 4,
    doctorCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Orthopedics',
    slug: 'orthopedics',
    description: 'Bone and joint specialists',
    icon: 'bone',
    color: '#F59E0B',
    isActive: true,
    order: 5,
    doctorCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Dermatology',
    slug: 'dermatology',
    description: 'Skin and hair specialists',
    icon: 'skin',
    color: '#EC4899',
    isActive: true,
    order: 6,
    doctorCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Pediatrics',
    slug: 'pediatrics',
    description: 'Children healthcare specialists',
    icon: 'baby',
    color: '#06B6D4',
    isActive: true,
    order: 7,
    doctorCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Gynecology',
    slug: 'gynecology',
    description: 'Women healthcare specialists',
    icon: 'female',
    color: '#F97316',
    isActive: true,
    order: 8,
    doctorCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedDoctorCategories() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('wp-database-hci');
    const categoriesCollection = db.collection('doctorCategories');
    
    // Check if categories already exist
    const existingCategories = await categoriesCollection.countDocuments();
    
    if (existingCategories > 0) {
      console.log('Doctor categories already exist in the database. Skipping seed.');
      return;
    }
    
    // Insert default categories
    const result = await categoriesCollection.insertMany(defaultDoctorCategories);
    console.log(`Successfully seeded ${result.insertedCount} doctor categories`);
    
    // List the created categories
    console.log('\nCreated categories:');
    defaultDoctorCategories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug})`);
    });
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

seedDoctorCategories();