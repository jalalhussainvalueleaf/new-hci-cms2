import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('wp-database-hci');
    
    const testimonials = await db.collection('testimonials')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error('Get testimonials error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const testimonialData = await request.json();
    const { name, title, content, image, rating, status } = testimonialData;

    if (!name || !title || !content) {
      return NextResponse.json(
        { error: 'Name, title, and content are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('wp-database-hci');

    const newTestimonial = {
      name,
      title,
      content,
      image: image || '',
      rating: parseFloat(rating) || 5,
      status: status || 'active',
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('testimonials').insertOne(newTestimonial);
    newTestimonial._id = result.insertedId;

    return NextResponse.json({
      message: 'Testimonial created successfully',
      testimonial: newTestimonial
    }, { status: 201 });
  } catch (error) {
    console.error('Create testimonial error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}