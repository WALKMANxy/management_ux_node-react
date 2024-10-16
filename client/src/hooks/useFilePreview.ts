import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { downloadFileFromS3 } from "../features/data/api/media";
import {
  addDownloadedFile,
  clearDownloadedFiles,
  selectDownloadedFiles,
} from "../features/downloads/downloadedFilesSlice";

// Define the structure of the attachment
export interface Attachment {
  file?: File; // Local file, only for client-side usage
  url: string;
  type: "image" | "video" | "pdf" | "word" | "excel" | "csv" | "other";
  fileName: string;
  size: number;
  chatId?: string; // Add this line
  messageId?: string; // Add this line
  // thumbnailUrl?: string; // Optional thumbnail for images
}

const MAX_FILES = 10; // Maximum number of files allowed
const MAX_FILE_SIZE_MB = 15; // Max size per file in MB
const MAX_TOTAL_SIZE_MB = 50; // Max total size of all files in MB

// Hook to manage file preview and download logic
export const useFilePreview = () => {
  const dispatch = useAppDispatch();
  const downloadedFiles = useAppSelector(selectDownloadedFiles);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<Attachment | null>(null);
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>(
    []
  );
  const [downloadProgresses, setDownloadProgresses] = useState<{
    [key: string]: number;
  }>({});

  const downloadedFilesRef = useRef(downloadedFiles);

  const [isPreview, setIsPreview] = useState<boolean>(false);

  useEffect(() => {
    downloadedFilesRef.current = downloadedFiles;
  }, [downloadedFiles]);

  useEffect(() => {
    console.log("Downloaded files:", downloadedFiles);
  }, [downloadedFiles]);

  const downloadAndStoreFile = useCallback(
    async (attachment: Attachment) => {
      if (!attachment.chatId || !attachment.messageId) {
        toast.error("Missing chatId or messageId for the attachment.");
        console.error("Attachment is missing chatId or messageId:", attachment);
        return;
      }

      console.groupCollapsed(`Downloading file: ${attachment.fileName}`);
      try {
        console.log(`Download request:`, attachment);
        const blobUrl = await downloadFileFromS3(attachment, (progress) => {
          console.log(`Download progress: ${progress}%`);
          setDownloadProgresses((prev) => ({
            ...prev,
            [attachment.fileName]: progress,
          }));
        });

        console.log(`Download complete:`, blobUrl);
        dispatch(
          addDownloadedFile({
            ...attachment,
            url: blobUrl ?? "",
          })
        );
      } catch (error) {
        toast.error(`Failed to download ${attachment.fileName}.`);
        console.error("Error downloading file:", error);
      } finally {
        console.groupEnd();
      }
    },
    [dispatch]
  );

  const clearDownloadedData = useCallback(() => {
    dispatch(clearDownloadedFiles());
  }, [dispatch]);

  const download = useCallback(
    (fileName: string) => {
      try {
        // Use the ref to access the latest downloadedFiles
        const currentDownloadedFiles = [...downloadedFilesRef.current];
        console.debug(
          "Current downloaded files in 'download':",
          currentDownloadedFiles
        );

        const fileToDownload = currentDownloadedFiles.find(
          (file) => file.fileName === fileName
        );

        if (!fileToDownload || !fileToDownload.url) {
          toast.error("File not found or invalid file URL.");
          console.error("File not found with fileName:", fileName);
          return;
        }

        const link = document.createElement("a");
        link.href = fileToDownload.url;
        link.download = fileToDownload.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        toast.error("Failed to download the file.");
        console.error("Error downloading the file:", error);
      }
    },
    [] // Remove downloadedFiles from dependencies
  );
  const openFileViewer = useCallback(
    (isPreview: boolean, fileName?: string) => {
      console.groupCollapsed("openFileViewer");
      console.log("isPreview:", isPreview);
      console.log("fileName:", fileName);
      console.log("selectedAttachments:", selectedAttachments);
      console.log("downloadedFiles:", downloadedFilesRef.current);
      console.groupEnd();

      setIsPreview(isPreview);

      if (isPreview) {
        if (selectedAttachments.length === 0) {
          toast.error("No attachments available for preview.");
          return;
        }
        setCurrentFile(selectedAttachments[0]);
        setIsViewerOpen(true);
      } else {
        const selectedFile = downloadedFilesRef.current.find(
          (file) => file.fileName === fileName
        );

        if (!selectedFile) {
          toast.error("File not found in downloadedFiles.");
          console.error(
            "File not found in downloadedFiles with fileName:",
            fileName
          );
          return;
        }

        const fileToView = {
          ...selectedFile,
          url: selectedFile.url,
        };

        setCurrentFile(fileToView);
        setIsViewerOpen(true);
      }

      // Rest of your logic
    },
    [selectedAttachments, downloadedFilesRef] // Remove downloadedFiles from dependencies
  );

  const addAttachments = useCallback(
    (attachments: Attachment[]) => {
      setSelectedAttachments((prev) => {
        // Use a Set for efficient lookups of existing file names and sizes
        const existingAttachmentsSet = new Set(
          prev.map((att) => `${att.fileName}-${att.size}`)
        );

        // Filter out attachments that already exist based on both fileName and size
        const uniqueAttachments = attachments.filter((newAttachment) => {
          const uniqueKey = `${newAttachment.fileName}-${newAttachment.size}`;
          return !existingAttachmentsSet.has(uniqueKey);
        });

        // Return the new list of attachments with the unique ones appended
        return [...prev, ...uniqueAttachments];
      });
    },
    [setSelectedAttachments]
  );

  const removeAttachment = useCallback(
    (fileName: string) => {
      setSelectedAttachments((prev) => {
        // Find the attachment to remove based on fileName
        const attToRemove = prev.find((att) => att.fileName === fileName);

        // Revoke object URL to prevent memory leaks
        if (attToRemove) {
          URL.revokeObjectURL(attToRemove.url); // Free up memory for Blob URL
        } else {
          console.warn(`Attachment with fileName "${fileName}" not found.`);
        }

        // Return the filtered attachments, removing the one with the matching fileName
        return prev.filter((att) => att.fileName !== fileName);
      });
    },
    [setSelectedAttachments]
  );

  const clearAttachments = useCallback(() => {
    setSelectedAttachments((prev) => {
      // Revoke all object URLs before clearing
      prev.forEach((attachment) => {
        URL.revokeObjectURL(attachment.url);
      });

      // Clear all attachments
      return [];
    });
  }, [setSelectedAttachments]);

  // Function to handle closing the file viewer
  const closeFileViewer = useCallback(
    (isPreview: boolean) => {
      setIsViewerOpen(false);
      setIsPreview(false); // Always reset to false when closing
      setCurrentFile(null);

      // If in preview mode, clear the attachments
      if (isPreview) {
        clearAttachments();
      }
    },
    [setIsViewerOpen, setCurrentFile, clearAttachments]
  );

  // Function to handle selecting files
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files) {
        const selectedFiles = Array.from(files);

        // Check if more than 10 files are selected
        if (selectedFiles.length > MAX_FILES) {
          toast.error("You can select up to 10 files at a time");
          return;
        }

        // Check if any file exceeds 15MB
        const oversizedFile = selectedFiles.find(
          (file) => file.size > MAX_FILE_SIZE_MB * 1024 * 1024
        );
        if (oversizedFile) {
          toast.error(`File ${oversizedFile.name} exceeds 15MB`);
          return;
        }

        // Check if the total size of all files exceeds 50MB
        const totalSize = selectedFiles.reduce(
          (acc, file) => acc + file.size,
          0
        );
        if (totalSize > MAX_TOTAL_SIZE_MB * 1024 * 1024) {
          toast.error("The total size of selected files exceeds 50MB");
          return;
        }

        // Process the files and create the Attachment array
        const fileArray: Attachment[] = selectedFiles
          .map((file) => {
            const extension = file.name.split(".").pop()?.toLowerCase(); // Extract file extension
            let fileType:
              | "image"
              | "video"
              | "pdf"
              | "word"
              | "excel"
              | "csv"
              | "other";

            // If extension is not found or not supported, show an error
            if (!extension) {
              toast.error("Unsupported file type.");
              return null;
            }

            // File type determination based on the extension
            if (["png", "jpg", "jpeg", "gif", "webp"].includes(extension)) {
              fileType = "image";
            } else if (
              [
                "avi",
                "mov",
                "mp4",
                "m4v",
                "mpg",
                "mpeg",
                "webm",
                "wmv",
              ].includes(extension)
            ) {
              fileType = "video";
            } else if (["pdf"].includes(extension)) {
              fileType = "pdf";
            } else if (["doc", "docx", "rtf", "wpd"].includes(extension)) {
              fileType = "word";
            } else if (["xls", "xlsx", "xlsm", "ods"].includes(extension)) {
              fileType = "excel";
            } else if (["csv"].includes(extension)) {
              fileType = "csv";
            } else {
              toast.error("File extension not supported");
              return null;
            }

            // Return the Attachment object with the file stored locally
            return {
              file, // Keep the file locally on the client side
              url: URL.createObjectURL(file), // Temporary URL for preview
              type: fileType,
              fileName: file.name,
              size: file.size,
            };
          })
          .filter((item) => item !== undefined && item !== null); // Filter out null and undefined entries from unsupported extensions

        // Add the valid attachments to the state
        addAttachments(fileArray);
        // console.log("Selected Files:", fileArray);
      }
    },
    [addAttachments]
  );
  // In useEffect
  useEffect(() => {
    if (selectedAttachments.length > 0) {
      console.log("Opening File Viewer with Attachments:", selectedAttachments);
      openFileViewer(true);
    }
  }, [selectedAttachments, openFileViewer]);

  return {
    isViewerOpen,
    currentFile,
    openFileViewer,
    closeFileViewer,
    download,
    setCurrentFile,
    addAttachments,
    removeAttachment,
    clearAttachments,
    selectedAttachments,
    handleFileSelect,
    isPreview,
    downloadAndStoreFile,
    downloadProgresses,
    clearDownloadedData,
  };
};
