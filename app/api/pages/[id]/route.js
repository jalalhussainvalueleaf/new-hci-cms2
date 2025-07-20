import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/pages/[id] - Get a single page by ID
export async function GET(request, { params }) {
  console.log('GET /api/pages/[id] - Request received for ID:', params.id);
  
  try {
    const { id } = params;
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      console.error('Invalid ObjectId:', id);
      return NextResponse.json(
        { error: 'Invalid page ID format' },
        { status: 400 }
      );
    }
    
    console.log('Connecting to MongoDB...');
    const client = await clientPromise;
    const db = client.db('wp-database-hci');
    
    console.log('Querying page with ID:', id);
    const page = await db.collection('pages').findOne({ _id: new ObjectId(id) });
    
    if (!page) {
      console.error('Page not found with ID:', id);
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }
    
    // Convert _id to string for client-side and ensure all fields have proper defaults
    const pageWithStringId = {
      ...page,
      _id: page._id.toString(),
      // Ensure tags is always an array
      tags: Array.isArray(page.tags) ? page.tags : [],
      // Ensure categories is always an array
      categories: Array.isArray(page.categories) ? page.categories : [],
      // Ensure all date fields are properly formatted
      createdAt: page.createdAt ? new Date(page.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: page.updatedAt ? new Date(page.updatedAt).toISOString() : new Date().toISOString(),
      // Ensure other fields have proper defaults
      featured: !!page.featured,
      allowComments: page.allowComments !== false, // Default to true if not set
      status: page.status || 'draft',
      template: page.template || 'default',
      author: page.author || 'Admin'
    };
    
    console.log('Page found:', JSON.stringify(pageWithStringId, null, 2));
    return NextResponse.json({ 
      success: true,
      page: pageWithStringId 
    });
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}

// PUT /api/pages/[id] - Update a page
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid page ID' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db('wp-database-hci');
    
    // Prepare update data
    const updateData = {
      $set: {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        status: data.status,
        slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        featured: data.featured,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        featuredImage: data.featuredImage,
        template: data.template || 'default',
        allowComments: data.allowComments !== false, // Default to true if not set
        author: data.author || 'Admin',
        updatedAt: new Date()
      }
    };

    // Update the page in the database
    const result = await db.collection('pages').updateOne(
      { _id: new ObjectId(id) },
      updateData
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    // Fetch the updated page
    const updatedPage = await db.collection('pages').findOne({ _id: new ObjectId(id) });

    // Convert _id to string for client-side
    const pageWithStringId = {
      ...updatedPage,
      _id: updatedPage._id.toString()
    };

    return NextResponse.json({ 
      message: 'Page updated successfully',
      page: pageWithStringId 
    });
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    );
  }
}

// DELETE /api/pages/[id] - Delete a page
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid page ID' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db('wp-database-hci');
    
    // Delete the page
    const result = await db.collection('pages').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Page deleted successfully',
      pageId: id
    });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}
