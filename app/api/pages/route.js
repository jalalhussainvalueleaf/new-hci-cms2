import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/pages - Get all pages
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('wp-database-hci');
    
    const pages = await db.collection('pages')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

// POST /api/pages - Create a new page
export async function POST(request) {
  try {
    const data = await request.json();
    
    if (!data.title || !data.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('wp-database-hci');
    
    const newPage = {
      title: data.title,
      content: data.content,
      excerpt: data.excerpt || '',
      status: data.status || 'draft',
      slug: data.slug || data.title.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, ''),
      featured: data.featured || false,
      metaTitle: data.metaTitle || data.title,
      metaDescription: data.metaDescription || data.excerpt || '',
      featuredImage: data.featuredImage || '',
      template: data.template || 'default',
      author: data.author || 'Admin',
      allowComments: data.allowComments !== undefined ? data.allowComments : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('pages').insertOne(newPage);
    
    return NextResponse.json(
      { 
        message: 'Page created successfully', 
        page: { _id: result.insertedId, ...newPage }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    );
  }
}
