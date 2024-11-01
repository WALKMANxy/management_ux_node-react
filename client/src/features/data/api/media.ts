//src/features/data/api/media.ts
import axios, { AxiosError, AxiosProgressEvent, AxiosResponse } from "axios";
import { Attachment } from "../../../models/dataModels";
import { apiCall } from "../../../utils/apiUtils";
import { cacheFile, getCachedFile } from "../../../utils/cacheUtils";

// Request pre-signed URL for chat file upload
export const getChatFileUploadUrl = async (
  chatId: string,
  messageId: string,
  fileName: string
): Promise<string> => {
  /*  console.log(
    `Requesting pre-signed URL for file upload: chatId=${chatId}, messageId=${messageId}, fileName=${fileName}`
  ); */

  const endpoint = `/media/chats/${chatId}/${messageId}?fileName=${encodeURIComponent(
    fileName
  )}`;

  try {
    // Make the API call to get the pre-signed URL
    const response = await apiCall<{ uploadUrl: string }>(endpoint, "GET");
    // console.log(`Received pre-signed URL: ${response.uploadUrl}`);
    return response.uploadUrl;
  } catch (error) {
    console.error(
      `Error fetching pre-signed URL for chat file upload: chatId=${chatId}, messageId=${messageId}, fileName=${fileName}`,
      error
    );
    throw new Error("Failed to obtain pre-signed URL for file upload.");
  }
};

// Request pre-signed URL for chat file download
export const getChatFileDownloadUrl = async (
  chatId: string,
  messageId: string,
  fileName: string
): Promise<string> => {
  const endpoint = `/media/chats/${chatId}/${messageId}/${encodeURIComponent(
    fileName
  )}/download`;

  try {
    // Make the API call to get the pre-signed URL
    const response = await apiCall<{ downloadUrl: string }>(endpoint, "GET");
    // console.log(`Received pre-signed download URL: ${response.downloadUrl}`);
    return response.downloadUrl;
  } catch (error) {
    console.error(
      `Error fetching pre-signed URL for chat file download: chatId=${chatId}, messageId=${messageId}, fileName=${fileName}`,
      error
    );
    throw new Error("Failed to obtain pre-signed URL for file download.");
  }
};

// Request pre-signed URL for slideshow file upload
export const getSlideshowFileUploadUrl = async (
  currentMonth: string,
  fileName: string
): Promise<string> => {
  /* console.log(
    `Requesting pre-signed URL for slideshow upload: currentMonth=${currentMonth}, fileName=${fileName}`
  ); */

  const endpoint = `/media/slideshow/${currentMonth}?fileName=${encodeURIComponent(
    fileName
  )}`;

  try {
    const response = await apiCall<{ uploadUrl: string }>(endpoint, "GET");
    // console.log(`Received slideshow pre-signed URL: ${response.uploadUrl}`);
    return response.uploadUrl;
  } catch (error) {
    console.error(
      `Error fetching pre-signed URL for slideshow upload: currentMonth=${currentMonth}, fileName=${fileName}`,
      error
    );
    throw new Error("Failed to obtain pre-signed URL for slideshow upload.");
  }
};

export const uploadFileToS3 = async (
  file: File,
  uploadUrl: string,
  fileName: string,
  onUploadProgress: (progress: number) => void
): Promise<void> => {
  // console.log(`Uploading file ${file.name} to S3 with URL: ${uploadUrl}`);

  try {
    // console.log("Making PUT request to S3:");
    const response: AxiosResponse<void> = await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        const total = progressEvent.total;
        const loaded = progressEvent.loaded;
        const progress = total ? Math.round((loaded * 100) / total) : 0;
        // console.log(`Upload progress: ${progress}%`);
        onUploadProgress(progress);
      },
    });

    if (response.status === 200 || response.status === 204) {
      // console.log("File uploaded successfully to S3.");

      // After successful upload, cache the file
      try {
        // Assuming cacheFile takes (fileName: string, blob: Blob) and returns a Promise<string> for the object URL
        /* const cachedObjectUrl = */ await cacheFile(fileName, file);
        /*  console.log(
          `File ${fileName} cached successfully. Object URL: ${cachedObjectUrl}`
        ); */
      } catch (cacheError) {
        // Log caching errors without throwing to avoid interrupting the upload flow
        console.error(`Failed to cache file ${file.name}:`, cacheError);
      }
    } else {
      console.error(
        `Unexpected response status during S3 upload: ${response.status}`
      );
      throw new Error(`S3 upload failed with status code ${response.status}`);
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error("Error uploading file to S3:", axiosError.message);
      if (axiosError.response) {
        console.error("S3 response data:", axiosError.response.data);
      }
      throw new Error("Failed to upload file to S3.");
    } else {
      console.error("Unknown error occurred during file upload:", error);
      throw new Error("Failed to upload file to S3.");
    }
  }
};

export const downloadFileFromS3 = async (
  attachment: Attachment,
  onDownloadProgress: (progress: number) => void
): Promise<string | null> => {
  try {
    // Check if chatId and messageId exist before proceeding
    if (!attachment.chatId || !attachment.messageId) {
      console.error(
        "Missing chatId or messageId for the attachment:",
        attachment
      );
      return null;
    }

    // Check if the file is already cached
    const cachedFile = await getCachedFile(attachment.fileName);
    if (cachedFile) {
      /*  console.log(
        `File ${attachment.fileName} found in cache. Using cached version.`
      ); */
      return cachedFile.objectUrl;
    }

    // File not cached; proceed to download
    const downloadUrl = await getChatFileDownloadUrl(
      attachment.chatId,
      attachment.messageId,
      attachment.fileName
    );

    // console.log(`Downloading file from URL: ${downloadUrl}`);

    const response: AxiosResponse<Blob> = await axios.get(downloadUrl, {
      responseType: "blob",
      onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
        const total = progressEvent.total;
        const loaded = progressEvent.loaded;
        if (total) {
          const progress = Math.round((loaded * 100) / total);
          // console.log(`Download progress: ${progress}%`);
          onDownloadProgress(progress);
        }
      },
    });

    if (response.status === 200) {
      const blob = response.data;
      /* console.log(
        `File ${attachment.fileName} downloaded successfully. Caching the file.`
      ); */

      try {
        const cachedObjectUrl = await cacheFile(attachment.fileName, blob);
        /*  console.log(
          `File ${attachment.fileName} cached successfully. Object URL: ${cachedObjectUrl}`
        ); */
        return cachedObjectUrl;
      } catch (cacheError) {
        console.error(
          `Failed to cache downloaded file ${attachment.fileName}:`,
          cacheError
        );
        return URL.createObjectURL(blob); // Fallback to object URL without caching
      }
    } else {
      console.error(
        `Unexpected response status during file download: ${response.status}`
      );
      throw new Error(
        `File download failed with status code ${response.status}`
      );
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error("Error downloading file from S3:", axiosError.message);
      if (axiosError.response) {
        console.error("Download response data:", axiosError.response.data);
      }
      throw new Error("Failed to download file from S3.");
    } else {
      console.error("Unknown error occurred during file download:", error);
      throw new Error("Failed to download file from S3.");
    }
  }
};
