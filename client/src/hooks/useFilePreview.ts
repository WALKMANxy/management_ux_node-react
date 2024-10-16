import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { downloadFileFromS3 } from "../features/data/api/media";

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
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<Attachment | null>(null);
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>(
    []
  );
  const [downloadProgresses, setDownloadProgresses] = useState<{
    [key: string]: number;
  }>({});
  const [downloadedFiles, setDownloadedFiles] = useState<Attachment[]>([]);
  const [downloadedThumbnails, setDownloadedThumbnails] = useState<
    Attachment[]
  >([]);

  const [isPreview, setIsPreview] = useState<boolean>(false);

  const downloadAndStoreFile = useCallback(async (attachment: Attachment) => {
    if (!attachment.chatId || !attachment.messageId) {
      toast.error("Missing chatId or messageId for the attachment.");
      console.error("Attachment is missing chatId or messageId:", attachment);
      return;
    }

    try {
      const blobUrl = await downloadFileFromS3(attachment, (progress) => {
        // Optionally update download progress state here if needed
        console.log(
          `Download progress for ${attachment.fileName}: ${progress}%`
        );
        setDownloadProgresses((prev) => ({
          ...prev,
          [attachment.fileName]: progress,
        }));
      });

      // Store the downloaded file in the state
      setDownloadedFiles((prev) => [
        ...prev,
        { ...attachment, url: blobUrl ?? "" },
      ]);
    } catch (error) {
      toast.error(`Failed to download ${attachment.fileName}.`);
      console.error("Error downloading file:", error);
    }
  }, []);

  /* useEffect(() => {
    console.log("hook - isViewerOpen:", isViewerOpen);
  }, [isViewerOpen]); */

  const clearDownloadedData = useCallback(() => {
    // Clear downloaded files
    setDownloadedFiles((prev) => {
      prev.forEach((attachment) => URL.revokeObjectURL(attachment.url));
      return [];
    });

    // Clear downloaded thumbnails
    setDownloadedThumbnails((prev) => {
      prev.forEach((attachment) => URL.revokeObjectURL(attachment.url));
      return [];
    });
  }, []);

  const download = useCallback((attachment: Attachment) => {
    try {
      // Check if the attachment URL exists and is valid
      if (!attachment.url) {
        toast.error("Invalid file URL.");
        return;
      }

      // Create a link element
      const link = document.createElement("a");
      link.href = attachment.url; // URL can be a blob or a remote file URL

      // Set the download attribute with the file name
      link.download = attachment.fileName;

      // Trigger the download
      document.body.appendChild(link); // Append to the DOM temporarily
      link.click(); // Programmatically click the link to download
      document.body.removeChild(link); // Remove it after downloading
    } catch (error) {
      toast.error("Failed to download the file.");
      console.error("Error downloading the file:", error);
    }
  }, []);

  const openFileViewer = useCallback(
    (isPreview: boolean, fileName?: string) => {
      setIsPreview(isPreview);

      if (isPreview) {
        console.log(
          "openFileViewer: Preview mode. Setting current file to the first attachment in the selectedAttachments array."
        );
        // Ensure selectedAttachments array is not empty in preview mode
        if (selectedAttachments.length === 0) {
          toast.error("No attachments available for preview.");
          return;
        }

        // Set the current file to the first attachment in the selectedAttachments array
        setCurrentFile(selectedAttachments[0]);
        console.log(
          "openFileViewer: Setting current file to",
          selectedAttachments[0]
        );
        setIsViewerOpen(true);
      } else {
        console.log(
          "openFileViewer: Not in preview mode. Finding file in the downloadedFiles array by fileName."
        );
        // Find the file in the downloadedFiles array by fileName
        const fileToView = downloadedFiles.find(
          (file) => file.fileName === fileName
        );

        // Handle the case where the file isn't found
        if (!fileToView) {
          console.log("openFileViewer: Unable to open file. File not found.");
          toast.error("Unable to open file. File not found.");
          return;
        }

        // Set the current file to the clicked attachment
        setCurrentFile(fileToView);
        console.log("openFileViewer: Setting current file to", fileToView);
        setIsViewerOpen(true);
      }
    },
    [
      selectedAttachments,
      downloadedFiles,
      setCurrentFile,
      setIsViewerOpen,
      setIsPreview,
    ]
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
    // fetchAndStoreThumbnail, // New function
    clearDownloadedData, // New function
    downloadedFiles, // New state
    downloadedThumbnails, // New state
  };
};
