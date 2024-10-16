import axios from "axios";
import { apiCall } from "../../../utils/apiUtils";
import { Attachment } from "../../../hooks/useFilePreview";
import { cacheFile, getCachedFile } from "../../../utils/cacheUtils";

// Request pre-signed URL for chat file upload
export const getChatFileUploadUrl = async (
  chatId: string,
  messageId: string,
  fileName: string
): Promise<string> => {
  console.log(`Requesting pre-signed URL for file upload: chatId=${chatId}, messageId=${messageId}, fileName=${fileName}`);

  const endpoint = `/media/chats/${chatId}/${messageId}?fileName=${encodeURIComponent(fileName)}`;

  // Make the API call to get the pre-signed URL
  const response = await apiCall<{ uploadUrl: string }>(endpoint, "GET");

  console.log(`Received pre-signed URL: ${response.uploadUrl}`);

  return response.uploadUrl; // Return the pre-signed URL for file upload
};

// Request pre-signed URL for chat file download
export const getChatFileDownloadUrl = async (
  chatId: string,
  messageId: string,
  fileName: string
): Promise<string> => {
  const endpoint = `/media/chats/${chatId}/${messageId}/${encodeURIComponent(fileName)}/download`;

  // Make the API call to get the pre-signed URL
  const response = await apiCall<{ downloadUrl: string }>(endpoint, "GET");

  return response.downloadUrl;
};


// Request pre-signed URL for slideshow file upload
export const getSlideshowFileUploadUrl = async (
  currentMonth: string,
  fileName: string
): Promise<string> => {
  console.log(`Requesting pre-signed URL for slideshow upload: currentMonth=${currentMonth}, fileName=${fileName}`);

  const endpoint = `/media/slideshow/${currentMonth}?fileName=${encodeURIComponent(fileName)}`;

  const response = await apiCall<{ uploadUrl: string }>(endpoint, "GET");

  console.log(`Received slideshow pre-signed URL: ${response.uploadUrl}`);

  return response.uploadUrl;
};


// Upload file to S3 using the pre-signed URL and track progress
export const uploadFileToS3 = async (
  file: File,
  uploadUrl: string,
  onUploadProgress: (progress: number) => void
): Promise<void> => {
  console.log(`Uploading file to S3: file=${file.name}, uploadUrl=${uploadUrl}`);
  try {
    const response = await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total ?? 0)
        );
        console.log(`Upload progress: ${progress}%`);
        onUploadProgress(progress);
      },
    });

    if (!response.status.toString().startsWith("2")) {
      throw new Error(`File upload failed with status ${response.status}`);
    }

    console.log("File uploaded successfully to S3");
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};



export const downloadFileFromS3 = async (
  attachment: Attachment,
  onDownloadProgress: (progress: number) => void
): Promise<string | null> => {
  try {
    // Check if chatId and messageId exist before proceeding
    if (!attachment.chatId || !attachment.messageId) {
      console.error("Missing chatId or messageId for the attachment.");
      return null;
    }

    // Check if the file is already cached
    const cachedFile = await getCachedFile(attachment.fileName);
    if (cachedFile) {
      console.log(`File ${attachment.fileName} found in cache. Using cached version.`);
      return cachedFile.objectUrl;
    }

    // File not cached; proceed to download
    const downloadUrl = await getChatFileDownloadUrl(
      attachment.chatId,
      attachment.messageId,
      attachment.fileName
    );

    const response = await axios.get(downloadUrl, {
      responseType: "blob",
      onDownloadProgress: (progressEvent) => {
        const totalLength = progressEvent.total;
        if (totalLength) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / totalLength
          );
          onDownloadProgress(progress);
        }
      },
    });

    // Cache the downloaded Blob
    const blob = response.data as Blob;
    const cachedObjectUrl = await cacheFile(attachment.fileName, blob);

    return cachedObjectUrl;
  } catch (error) {
    console.error("Error downloading file from S3:", error);
    throw error;
  }
};
