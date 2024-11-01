//src/services/mediaService.ts
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "../config/config";

const s3 = new S3Client({
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
  region: config.region,
});

const bucketName = config.bucketName!;

// Generate pre-signed URL for chat file upload
export const generateChatFileUrl = async (
  chatId: string,
  messageId: string,
  fileName: string
) => {
  const filePath = `chats/${chatId}/${messageId}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: filePath,
    ACL: "private",
  });

  // Generate the pre-signed URL (valid for 5 minutes)
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  return uploadUrl;
};

// Generate pre-signed URL for chat file download
export const generateChatFileDownloadUrl = async (
  chatId: string,
  messageId: string,
  fileName: string
) => {
  const filePath = `chats/${chatId}/${messageId}/${fileName}`;

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: filePath,
  });

  const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  return downloadUrl;
};

// Generate pre-signed URL for slideshow file upload
export const generateSlideshowFileUrl = async (
  currentMonth: string,
  fileName: string
) => {
  const filePath = `slideshow/${currentMonth}/${fileName}`;

  // Create a PutObjectCommand for the slideshow file
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: filePath,
    ACL: "private",
  });

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
