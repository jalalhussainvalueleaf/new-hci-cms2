import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid doctor ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('wp-database-hci');
    
    const doctor = await db.collection('doctors').findOne({ _id: new ObjectId(id) });

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ doctor });
  } catch (error) {
    console.error('Get doctor error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const doctorData = await request.json();
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid doctor ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('wp-database-hci');

    const updateData = {
      name: doctorData.name,
      image: doctorData.image || '',
      category: doctorData.category,
      categoryId: doctorData.categoryId,
      qualification: doctorData.qualification || [''],
      experience: doctorData.experience,
      rating: parseFloat(doctorData.rating) || 0,
      reviews: parseInt(doctorData.reviews) || 0,
      expertise: doctorData.expertise || [''],
      publicationData: {
        heading: 'Publications',
        publications: doctorData.publicationData?.publications || ['']
      },
      researchData: {
        heading: 'Research',
        research: doctorData.researchData?.research || ['']
      },
      aboutData: {
        heading: 'About',
        about: doctorData.aboutData?.about || ''
      },
      isVerified: doctorData.isVerified || false,
      isActive: doctorData.isActive !== undefined ? doctorData.isActive : true,
      isFeatured: doctorData.isFeatured || false,
      reviewEnabled: doctorData.reviewEnabled || false,
      updatedAt: new Date(),
    };

    const result = await db.collection('doctors').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    const updatedDoctor = await db.collection('doctors').findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      message: 'Doctor updated successfully',
      doctor: updatedDoctor
    });
  } catch (error) {
    console.error('Update doctor error:', error);
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
        { error: 'Invalid doctor ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('wp-database-hci');

    const result = await db.collection('doctors').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    console.error('Delete doctor error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}