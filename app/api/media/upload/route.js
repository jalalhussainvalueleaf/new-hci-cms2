import { NextResponse } from 'next/server';
import { uploadToSpaces } from '@/lib/spaces';
import clientPromise from '@/lib/mongodb';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('wp-database-hci');
    const uploadedFiles = [];

    for (const file of files) {
      if (file.size === 0) continue;

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      
      try {
        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to DigitalOcean Spaces
        const fileUrl = await uploadToSpaces(buffer, fileName, 'wp-hci');

        // Save file info to database
        const fileDoc = {
          name: file.name,
          fileName: fileName,
          url: fileUrl,
          type: file.type,
          size: file.size,
          folder: 'wp-hci',
          uploadedAt: new Date(),
          uploadedBy: 'admin' // TODO: Get from authenticated user
        };

        const result = await db.collection('media').insertOne(fileDoc);
        fileDoc._id = result.insertedId;

        uploadedFiles.push(fileDoc);
      } catch (uploadError) {
        console.error(`Error uploading ${file.name}:`, uploadError);
        // Continue with other files
      }
    }

    return NextResponse.json({
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}