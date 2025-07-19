import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('wp-database-hci');
    
    const tags = await db.collection('tags')
      .find({})
      .sort({ name: 1 })
      .toArray();

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Get tags error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const tagData = await request.json();
    const { name, slug, description } = tagData;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('wp-database-hci');

    // Check if slug already exists
    const existingTag = await db.collection('tags').findOne({ slug });
    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag with this slug already exists' },
        { status: 409 }
      );
    }

    const newTag = {
      name,
      slug,
      description: description || '',
      count: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('tags').insertOne(newTag);
    newTag._id = result.insertedId;

    return NextResponse.json({
      message: 'Tag created successfully',
      tag: newTag
    }, { status: 201 });
  } catch (error) {
    console.error('Create tag error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}