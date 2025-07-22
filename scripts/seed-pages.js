require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

const dummyPages = [
  {
    title: 'About Us',
    slug: 'about-us',
    content: '<h1>About Our Company</h1><p>We are a leading company in our industry.</p>',
    excerpt: 'Learn more about our company and our mission.',
    status: 'published',
    featured: true,
    metaTitle: 'About Us | Our Story & Mission',
    metaDescription: 'Discover our company story and what drives us to deliver the best services.',
    featuredImage: '/images/about-hero.jpg',
    template: 'about',
    author: 'Admin',
    allowComments: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Our Services',
    slug: 'services',
    content: '<h1>Our Services</h1><p>We offer a wide range of services to meet your needs.</p>',
    excerpt: 'Explore the services we provide to our clients.',
    status: 'published',
    featured: true,
    metaTitle: 'Our Services | What We Offer',
    metaDescription: 'Discover the range of services we provide to help your business grow.',
    featuredImage: '/images/services-hero.jpg',
    template: 'services',
    author: 'Admin',
    allowComments: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Contact Us',
    slug: 'contact',
    content: '<h1>Get in Touch</h1><p>We would love to hear from you.</p>',
    excerpt: 'Reach out to us for any inquiries or questions.',
    status: 'published',
    featured: false,
    metaTitle: 'Contact Us | Get in Touch',
    metaDescription: 'Contact our team for any questions or inquiries.',
    featuredImage: '/images/contact-hero.jpg',
    template: 'contact',
    author: 'Admin',
    allowComments: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content: '<h1>Privacy Policy</h1><p>Your privacy is important to us.</p>',
    excerpt: 'Learn how we protect your personal information.',
    status: 'published',
    featured: false,
    metaTitle: 'Privacy Policy | Your Data Security',
    metaDescription: 'Read our privacy policy to understand how we handle your data.',
    template: 'default',
    author: 'Admin',
    allowComments: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Terms of Service',
    slug: 'terms-of-service',
    content: '<h1>Terms of Service</h1><p>Please read our terms and conditions carefully.</p>',
    excerpt: 'Our terms and conditions for using our services.',
    status: 'published',
    featured: false,
    metaTitle: 'Terms of Service | Legal Information',
    metaDescription: 'Review our terms and conditions for using our services.',
    template: 'default',
    author: 'Admin',
    allowComments: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('wp-database-hci');
    const pagesCollection = db.collection('pages');
    
    // Check if pages already exist
    const existingPages = await pagesCollection.countDocuments();
    
    if (existingPages > 0) {
      console.log('Pages already exist in the database. Skipping seed.');
      return;
    }
    
    // Insert dummy pages
    const result = await pagesCollection.insertMany(dummyPages);
    console.log(`Successfully seeded ${result.insertedCount} pages`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

seedDatabase();
