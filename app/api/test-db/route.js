import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('Attempting to connect to MongoDB...');
    const client = await clientPromise;
    console.log('MongoDB client connected successfully');
    
    // Test the connection by listing database names
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    
    // Get the current database stats
    const db = client.db('wp-database-hci');
    const stats = await db.stats();
    
    // Try to count users
    let userCount;
    try {
      userCount = await db.collection('users').countDocuments();
    } catch (countError) {
      console.error('Error counting users:', countError);
      userCount = 'Error: ' + countError.message;
    }

    return NextResponse.json({
      success: true,
      databaseStats: stats,
      availableDatabases: dbs.databases.map(db => db.name),
      userCount,
      currentDb: 'wp-database-hci',
      collections: await db.listCollections().toArray().then(collections => 
        collections.map(c => c.name)
      )
    });
    
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        env: {
          nodeEnv: process.env.NODE_ENV,
          hasMongoUri: !!process.env.MONGODB_URI,
          mongoUriPrefix: process.env.MONGODB_URI ? 
            process.env.MONGODB_URI.substring(0, 20) + '...' : 
            'Not set'
        }
      },
      { status: 500 }
    );
  }
}
