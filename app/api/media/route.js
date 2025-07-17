import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { deleteFromSpaces } from '@/lib/spaces';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('wp-database-hci');
    
    const media = await db.collection('media')
      .find({})
      .sort({ uploadedAt: -1 })
      .toArray();

    return NextResponse.json({ media });
  } catch (error) {
    console.error('Get media error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('wp-database-hci');

    // Get file info
    const file = await db.collection('media').findOne({ _id: new ObjectId(id) });
    
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Delete from DigitalOcean Spaces
    try {
      await deleteFromSpaces(file.fileName, file.folder);
    } catch (deleteError) {
      console.error('Error deleting from Spaces:', deleteError);
      // Continue with database deletion even if Spaces deletion fails
    }

    // Delete from database
    await db.collection('media').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete media error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}