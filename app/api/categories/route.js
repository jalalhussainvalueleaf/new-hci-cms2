import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('wp-database-hci');
    
    const categories = await db.collection('categories')
      .find({})
      .sort({ name: 1 })
      .toArray();

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const categoryData = await request.json();
    const { name, slug, description, parent } = categoryData;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('wp-database-hci');

    // Check if slug already exists
    const existingCategory = await db.collection('categories').findOne({ slug });
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 409 }
      );
    }

    const newCategory = {
      name,
      slug,
      description: description || '',
      parent: parent || null,
      count: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('categories').insertOne(newCategory);
    newCategory._id = result.insertedId;

    return NextResponse.json({
      message: 'Category created successfully',
      category: newCategory
    }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}