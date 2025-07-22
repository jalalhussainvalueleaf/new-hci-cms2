import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('wp-database-hci');
    
    const doctors = await db.collection('doctors')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error('Get doctors error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const doctorData = await request.json();
    
    if (!doctorData.name || !doctorData.category || !doctorData.experience) {
      return NextResponse.json(
        { error: 'Name, category, and experience are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('wp-database-hci');

    const newDoctor = {
      name: doctorData.name,
      image: doctorData.image || '',
      category: doctorData.category,
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('doctors').insertOne(newDoctor);
    newDoctor._id = result.insertedId;

    return NextResponse.json({
      message: 'Doctor created successfully',
      doctor: newDoctor
    }, { status: 201 });
  } catch (error) {
    console.error('Create doctor error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}