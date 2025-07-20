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
    
    // Explicitly include all necessary fields
    const post = await db.collection('posts').findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          title: 1,
          content: 1,
          excerpt: 1,
          status: 1,
          category: 1,
          tags: 1,
          featured: 1,
          allowComments: 1,
          metaTitle: 1,
          metaDescription: 1,
          featuredImage: 1,
          createdAt: 1,
          updatedAt: 1,
          publishedAt: 1
        }
      }
    );

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Ensure featured is a boolean
    const normalizedPost = {
      ...post,
      featured: Boolean(post.featured)
    };

    console.log('Returning post data:', {
      _id: normalizedPost._id,
      title: normalizedPost.title,
      featured: normalizedPost.featured,
      featuredImage: normalizedPost.featuredImage
    });

    return NextResponse.json({ post: normalizedPost });
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
    
    console.log('=== REQUEST BODY ===');
    console.log(JSON.stringify(postData, null, 2));
    console.log('====================');
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('wp-database-hci');

    // Log the raw post data received with all fields
    console.log('=== RAW POST DATA RECEIVED ===');
    console.log('Title:', postData.title);
    console.log('Excerpt:', postData.excerpt);
    console.log('Category:', postData.category);
    console.log('Tags:', JSON.stringify(postData.tags, null, 2));
    console.log('Featured:', postData.featured, '(type:', typeof postData.featured, ')');
    console.log('Allow Comments:', postData.allowComments);
    console.log('Meta Title:', postData.metaTitle);
    console.log('Meta Description:', postData.metaDescription);
    console.log('Featured Image:', postData.featuredImage);
    console.log('Status:', postData.status);
    console.log('=============================');
    
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
    
    // Log the exact update operation we're about to perform
    console.log('=== UPDATE OPERATION ===');
    console.log('Collection: posts');
    console.log('Filter:', { _id: new ObjectId(id) });
    console.log('Update:', { $set: updateData });
    
    // Perform the update
    const result = await db.collection('posts').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    console.log('=== UPDATE RESULT ===');
    console.log('Matched Count:', result.matchedCount);
    console.log('Modified Count:', result.modifiedCount);
    console.log('Upserted ID:', result.upsertedId);
    console.log('Acknowledged:', result.acknowledged);
    
    // Fetch the document after update to verify
    const updatedDoc = await db.collection('posts').findOne({ _id: new ObjectId(id) });
    console.log('=== DOCUMENT AFTER UPDATE ===');
    console.log('Featured:', updatedDoc?.featured);
    console.log('Updated At:', updatedDoc?.updatedAt);
    console.log('=============================');

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
        featured: updatedPost.featured || false, // Include featured field
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