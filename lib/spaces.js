// Using AWS SDK v2 for better compatibility with DigitalOcean Spaces
const AWS = require('aws-sdk');
const https = require('https');

// DigitalOcean Spaces configuration
const spacesConfig = {
  endpoint: 'blr1.digitaloceanspaces.com', // Just the hostname, no protocol
  region: 'blr1',
  bucket: 'hci',
  accessKeyId: process.env.NEXT_PUBLIC_DO_SPACES_KEY || '',
  secretAccessKey: process.env.NEXT_PUBLIC_DO_SPACES_SECRET || ''
};

// Create a custom HTTPS agent to handle SSL validation
const agent = new https.Agent({
  rejectUnauthorized: process.env.NODE_ENV === 'production', // Only verify SSL in production
  // DigitalOcean Spaces requires SNI (Server Name Indication)
  servername: spacesConfig.endpoint
});

// Configure AWS SDK
AWS.config.update({
  accessKeyId: spacesConfig.accessKeyId,
  secretAccessKey: spacesConfig.secretAccessKey,
  region: spacesConfig.region,
  sslEnabled: true,
  httpOptions: { agent }
});

// Create an S3 client
const s3 = new AWS.S3({
  endpoint: `https://${spacesConfig.endpoint}`,
  signatureVersion: 'v4'
});

// Upload a file to DigitalOcean Spaces
export const uploadToSpaces = async (file, fileName, folder = 'wp-hci') => {
  const key = `${folder}/${fileName}`;
  
  const params = {
    Bucket: spacesConfig.bucket,
    Key: key,
    Body: file,
    ACL: 'public-read',
    ContentType: file.type || 'application/octet-stream',
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location; // Returns the public URL of the uploaded file
  } catch (error) {
    console.error('Error uploading to Spaces:', error);
    throw error;
  }
};

// Delete a file from DigitalOcean Spaces
export const deleteFromSpaces = async (fileName, folder = 'wp-hci') => {
  const key = `${folder}/${fileName}`;
  
  const params = {
    Bucket: spacesConfig.bucket,
    Key: key
  };

  try {
    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('Error deleting from Spaces:', error);
    throw error;
  }
};

// Generate a signed URL for a file
export const getSignedUploadUrl = async (fileName, folder = 'wp-hci') => {
  const key = `${folder}/${fileName}`;
  
  const params = {
    Bucket: spacesConfig.bucket,
    Key: key,
    Expires: 3600 // URL expires in 1 hour
  };

  try {
    const url = s3.getSignedUrl('putObject', params);
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

export default s3;