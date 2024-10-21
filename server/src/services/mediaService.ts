import { S3Client, /* ListObjectsV2Command,*/ PutObjectCommand, GetObjectCommand  } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config/config';

// Initialize S3 client once in the service
const s3 = new S3Client({
  credentials: {
    accessKeyId: config.accessKeyId,    // Loaded from environment variables
    secretAccessKey: config.secretAccessKey,
  },
  region: config.region,                // Specify the S3 bucket region
});

const bucketName = config.bucketName!;  // Load bucket name from environment variables

// Generate pre-signed URL for chat file upload
export const generateChatFileUrl = async (chatId: string, messageId: string, fileName: string) => {
  const filePath = `chats/${chatId}/${messageId}/${fileName}`;

  // Create a PutObjectCommand for uploading the file
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: filePath,
    ACL: 'private',  // Set the permissions (private by default)
  });

  // Generate the pre-signed URL (valid for 5 minutes)
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  return uploadUrl;
};

// Generate pre-signed URL for chat file download
export const generateChatFileDownloadUrl = async (chatId: string, messageId: string, fileName: string) => {
  const filePath = `chats/${chatId}/${messageId}/${fileName}`;

  // Create a GetObjectCommand for downloading the file
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: filePath,
  });

  // Generate the pre-signed URL (valid for 5 minutes)
  const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  return downloadUrl;
};

// Generate pre-signed URL for slideshow file upload
export const generateSlideshowFileUrl = async (currentMonth: string, fileName: string) => {
  const filePath = `slideshow/${currentMonth}/${fileName}`;

  // Create a PutObjectCommand for the slideshow file
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: filePath,
    ACL: 'private',  // Set the permissions
  });

  // Generate the pre-signed URL (valid for 5 minutes)
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  return uploadUrl;
};

/* // Test S3 Integration: List objects in the bucket
const testS3Integration = async () => {
  try {
    const command = new ListObjectsV2Command({ Bucket: bucketName });
    const result = await s3.send(command);
    console.log('S3 Integration Test: Successfully listed objects in the bucket:', result);
  } catch (error) {
    console.error('S3 Integration Test: Failed to list objects in the bucket:', error);
  }
};

// Call the test function on initialization
testS3Integration();
 */