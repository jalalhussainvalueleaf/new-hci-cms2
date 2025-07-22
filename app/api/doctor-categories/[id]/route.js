import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('wp-database-hci');
    
    const category = await db.collection('doctorCategories').findOne({ _id: new ObjectId(id) });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Get doctor category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const categoryData = await request.json();
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('wp-database-hci');

    // Check if slug already exists (excluding current category)
    if (categoryData.slug) {
      const existingCategory = await db.collection('doctorCategories').findOne({
        slug: categoryData.slug,
        _id: { $ne: new ObjectId(id) }
      });
      
      if (existingCategory) {
        return NextResponse.json(
          { error: 'Category with this slug already exists' },
          { status: 409 }
        );
      }
    }

    const updateData = {
      name: categoryData.name,
      slug: categoryData.slug,
      description: categoryData.description || '',
      icon: categoryData.icon || '',
      color: categoryData.color || '#3B82F6',
      isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
      order: categoryData.order || 0,
      updatedAt: new Date(),
    };

    const result = await db.collection('doctorCategories').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const updatedCategory = await db.collection('doctorCategories').findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      message: 'Doctor category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    console.error('Update doctor category error:', error);
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
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('wp-database-hci');

    // Check if category is being used by any doctors
    const doctorsUsingCategory = await db.collection('doctors').countDocuments({ 
      categoryId: new ObjectId(id) 
    });

    if (doctorsUsingCategory > 0) {
      return NextResponse.json(
        { error: `Cannot delete category. It is being used by ${doctorsUsingCategory} doctor(s).` },
        { status: 400 }
      );
    }

    const result = await db.collection('doctorCategories').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Doctor category deleted successfully'
    });
  } catch (error) {
    console.error('Delete doctor category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}