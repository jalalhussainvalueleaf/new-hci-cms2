import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('wp-database-hci');
    
    const post = await db.collection('posts').findOne({ _id: new ObjectId(id) });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const postData = await request.json();
    
    console.log('Received update for post ID:', id);
    console.log('Update data received:', JSON.stringify(postData, null, 2));
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('wp-database-hci');

    // Log the raw post data received
    console.log('Raw post data received:', JSON.stringify(postData, null, 2));
    
    // Create update data with explicit field mapping
    const updateData = {
      title: postData.title || '',
      content: postData.content || '',
      excerpt: postData.excerpt || '',
      status: postData.status || 'draft',
      category: postData.category || 'uncategorized',
      tags: postData.tags || [],
      featured: postData.featured || false,
      allowComments: postData.allowComments !== undefined ? postData.allowComments : true,
      metaTitle: postData.metaTitle || '',
      metaDescription: postData.metaDescription || '',
      featuredImage: postData.featuredImage || '', // Explicitly include featuredImage
      updatedAt: new Date(),
    };

    // Only update publishedAt if the post is being published now
    if (postData.status === 'published' && !postData.publishedAt) {
      updateData.publishedAt = new Date();
    }

    // Log the data that will be used for the update
    console.log('Preparing to update post with data:', JSON.stringify({
      ...updateData,
      // Truncate long content for better log readability
      content: updateData.content ? `${updateData.content.substring(0, 100)}...` : null,
      excerpt: updateData.excerpt ? `${updateData.excerpt.substring(0, 100)}...` : null,
    }, null, 2));
    
    // First, check if the post exists
    const existingPost = await db.collection('posts').findOne({ _id: new ObjectId(id) });
    console.log('Existing post data:', JSON.stringify({
      _id: existingPost?._id,
      title: existingPost?.title,
      featuredImage: existingPost?.featuredImage,
      updatedAt: existingPost?.updatedAt
    }, null, 2));
    
    // Perform the update
    console.log('Executing updateOne with filter:', { _id: new ObjectId(id) });
    const result = await db.collection('posts').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    console.log('Update result:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedId: result.upsertedId,
      acknowledged: result.acknowledged
    });

    console.log('Update result:', JSON.stringify({
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedId: result.upsertedId
    }, null, 2));

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Fetch the updated post to verify the saved data
    const updatedPost = await db.collection('posts').findOne({ _id: new ObjectId(id) });
    console.log('Updated post data from DB:', JSON.stringify({
      _id: updatedPost?._id,
      title: updatedPost?.title,
      featuredImage: updatedPost?.featuredImage,
      updatedAt: updatedPost?.updatedAt
    }, null, 2));

    return NextResponse.json({
      message: 'Post updated successfully',
      updatedFields: Object.keys(updateData),
      updatedPost: {
        _id: updatedPost._id.toString(),
        title: updatedPost.title,
        featuredImage: updatedPost.featuredImage,
        updatedAt: updatedPost.updatedAt,
        status: updatedPost.status
      }
    });
  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('wp-database-hci');

    const result = await db.collection('posts').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}