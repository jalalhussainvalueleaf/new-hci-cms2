import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid testimonial ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('wp-database-hci');
    
    const testimonial = await db.collection('testimonials').findOne({ _id: new ObjectId(id) });

    if (!testimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ testimonial });
  } catch (error) {
    console.error('Get testimonial error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const testimonialData = await request.json();
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid testimonial ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('wp-database-hci');

    const updateData = {
      name: testimonialData.name,
      title: testimonialData.title,
      content: testimonialData.content,
      image: testimonialData.image || '',
      rating: parseFloat(testimonialData.rating) || 5,
      status: testimonialData.status || 'active',
      featured: testimonialData.featured || false,
      updatedAt: new Date(),
    };

    const result = await db.collection('testimonials').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    const updatedTestimonial = await db.collection('testimonials').findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      message: 'Testimonial updated successfully',
      testimonial: updatedTestimonial
    });
  } catch (error) {
    console.error('Update testimonial error:', error);
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
        { error: 'Invalid testimonial ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('wp-database-hci');

    const result = await db.collection('testimonials').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}