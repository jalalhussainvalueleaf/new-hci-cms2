import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

// Configure AWS SDK
const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);

const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET,
});

// Upload file to DigitalOcean Spaces
export const uploadFile = async (file, folder = 'testimonials') => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Generate a unique filename
  const fileExtension = file.name.split('.').pop();
  const fileName = `${folder}/${uuidv4()}.${fileExtension}`;
  
  const params = {
    Bucket: process.env.DO_SPACES_BUCKET,
    Key: fileName,
    Body: buffer,
    ACL: 'public-read',
    ContentType: file.type,
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location; // Returns the public URL
  } catch (error) {
    console.error('Error uploading file to DO Spaces:', error);
    throw new Error('Failed to upload file');
  }
};

// Delete file from DigitalOcean Spaces
export const deleteFile = async (fileUrl) => {
  if (!fileUrl) return;
  
  try {
    // Extract the key from the URL
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove the leading '/'
    
    const params = {
      Bucket: process.env.DO_SPACES_BUCKET,
      Key: key,
    };
    
    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('Error deleting file from DO Spaces:', error);
    throw new Error('Failed to delete file');
  }
};
