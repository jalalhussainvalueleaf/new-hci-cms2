import { NextResponse } from 'next/server';
import s3 from '@/lib/spaces';

export async function GET() {
  try {
    const params = {
      Bucket: 'hci',
      Prefix: 'wp-hci/' // The folder where images are stored
    };

    const data = await s3.listObjectsV2(params).promise();
    
    // Filter out folders and map to a cleaner structure
    const mediaFiles = data.Contents
      .filter(item => !item.Key.endsWith('/')) // Exclude folders
      .map(item => ({
        url: `https://hci.blr1.digitaloceanspaces.com/${item.Key}`,
        key: item.Key,
        lastModified: item.LastModified,
        size: item.Size,
        name: item.Key.split('/').pop() // Get filename from path
      }));

    return NextResponse.json({ success: true, files: mediaFiles });
  } catch (error) {
    console.error('Error listing media files:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch media files' },
      { status: 500 }
    );
  }
}
