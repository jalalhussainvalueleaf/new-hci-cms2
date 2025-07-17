import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const spacesClient = new S3Client({
  endpoint: process.env.NEXT_PUBLIC_DO_SPACES_ENDPOINT,
  region: 'blr1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_DO_SPACES_KEY,
    secretAccessKey: process.env.NEXT_PUBLIC_DO_SPACES_SECRET,
  },
});

export const uploadToSpaces = async (file, fileName, folder = 'wp-hci') => {
  const key = `${folder}/${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_DO_SPACES_BUCKET,
    Key: key,
    Body: file,
    ACL: 'public-read',
    ContentType: file.type || 'application/octet-stream',
  });

  try {
    await spacesClient.send(command);
    return `${process.env.NEXT_PUBLIC_DO_SPACES_ENDPOINT}/${key}`;
  } catch (error) {
    console.error('Error uploading to Spaces:', error);
    throw error;
  }
};

export const deleteFromSpaces = async (fileName, folder = 'wp-hci') => {
  const key = `${folder}/${fileName}`;
  
  const command = new DeleteObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_DO_SPACES_BUCKET,
    Key: key,
  });

  try {
    await spacesClient.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting from Spaces:', error);
    throw error;
  }
};

export const getSignedUploadUrl = async (fileName, folder = 'wp-hci') => {
  const key = `${folder}/${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_DO_SPACES_BUCKET,
    Key: key,
    ACL: 'public-read',
  });

  try {
    const signedUrl = await getSignedUrl(spacesClient, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

export default spacesClient;