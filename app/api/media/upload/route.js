import { NextResponse } from 'next/server';
import { uploadToSpaces } from '@/lib/spaces';
import clientPromise from '@/lib/mongodb';

// Disable body parsing, we'll handle it manually
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to parse multipart form data
async function parseFormData(request) {
  try {
    console.log('=== Starting form data parsing ===');
    const formData = await request.formData();
    const files = [];
    
    console.log('Form data entries:');
    // Log all form data entries for debugging
    for (const [key, value] of formData.entries()) {
      if (value instanceof File || (value && typeof value === 'object' && 'name' in value && 'type' in value)) {
        console.log(`- File [${key}]: ${value.name} (${value.type}, ${value.size} bytes, last modified: ${value.lastModified})`);
        files.push(value);
      } else {
        console.log(`- Field [${key}]:`, value);
      }
    }
    
    console.log(`=== Found ${files.length} files in form data ===`);
    return files;
  } catch (error) {
    console.error('Error parsing form data:', error);
    throw new Error(`Failed to parse form data: ${error.message}`);
  }
}

export async function POST(request) {
  console.log('=== Starting file upload process ===');
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    // Parse form data
    console.log('Parsing form data...');
    const files = await parseFormData(request);
    console.log(`Processing ${files.length} files...`);

    if (!files || files.length === 0) {
      console.error('No files found in the request');
      return NextResponse.json(
        { 
          success: false,
          error: 'No files found in the request. Please select a file to upload.' 
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('wp-database-hci');
    const uploadedFiles = [];

    for (const file of files) {
      if (!file) {
        console.error('Received null or undefined file');
        continue;
      }

      console.log(`Processing file: ${file.name} (${file.type}, ${file.size} bytes)`);

      if (file.size === 0) {
        console.error('File is empty:', file.name);
        continue;
      }

      // Generate unique filename
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
      const fileName = `${timestamp}-${safeFileName}`;
      
      try {
        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        console.log(`Uploading ${file.name} to Spaces as ${fileName}`);
        
        // Upload to DigitalOcean Spaces
        const fileUrl = await uploadToSpaces(buffer, fileName, 'wp-hci');
        console.log(`Successfully uploaded to Spaces: ${fileUrl}`);

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

        console.log('Saving file metadata to database:', fileDoc);
        const result = await db.collection('media').insertOne(fileDoc);
        fileDoc._id = result.insertedId;

        console.log('File metadata saved successfully');
        uploadedFiles.push(fileDoc);
      } catch (uploadError) {
        console.error(`Error processing file ${file.name}:`, uploadError);
        return NextResponse.json(
          { 
            success: false,
            error: `Failed to process file: ${file.name}`,
            details: uploadError.message
          },
          { status: 500 }
        );
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to process any files. Please try again.' 
        },
        { status: 500 }
      );
    }

    console.log(`Successfully processed ${uploadedFiles.length} file(s)`);
    return NextResponse.json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      files: uploadedFiles,
      url: uploadedFiles[0]?.url // Return the URL of the first uploaded file
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}