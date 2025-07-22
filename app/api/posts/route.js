import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('wp-database-hci');
    
    const posts = await db.collection('posts')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const postData = await request.json();
    console.log("postData", postData);
    const { 
      title, 
      content, 
      excerpt, 
      status = 'draft', 
      category, 
      tags = [], 
      featured = false, 
      allowComments = true, 
      metaTitle, 
      metaDescription,
      featuredImage = "" // Add featuredImage to the destructured fields
    } = postData;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('wp-database-hci');

    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newPost = {
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 160) + '...',
      status,
      // featuredImage: featuredImage || null, // Include featuredImage in the new post
      featuredImage: featuredImage || "",
      category: category || 'uncategorized',
      tags,
      featured,
      allowComments,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      author: 'admin', // TODO: Get from authenticated user
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: status === 'published' ? new Date() : null,
      views: 0,
    };

    const result = await db.collection('posts').insertOne(newPost);
    newPost._id = result.insertedId;

    return NextResponse.json({
      message: 'Post created successfully',
      post: newPost
    }, { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}