import { useCallback, useState } from "react";
import { toast } from "sonner";

// Define the structure of the attachment
export interface Attachment {
  file?: File; // Local file, only for client-side usage
  url: string;
  type: "image" | "video" | "pdf" | "word" | "excel" | "csv" | "other";
  fileName: string;
  size: number;
  thumbnail?: string; // Optional thumbnail for images
}

const MAX_FILES = 10; // Maximum number of files allowed
const MAX_FILE_SIZE_MB = 15; // Max size per file in MB
const MAX_TOTAL_SIZE_MB = 50; // Max total size of all files in MB

interface UseFilePreviewReturn {
  isViewerOpen: boolean;
  currentFile: Attachment | null;
  openFileViewer: (attachment: Attachment, isPreview: boolean) => void;
  closeFileViewer: () => void;
  downloadFile: (attachment: Attachment) => void;
  setCurrentFile: (attachment: Attachment | null) => void;
  addAttachments: (attachments: Attachment[]) => void;
  removeAttachment: (fileName: string) => void;
  clearAttachments: () => void;
  selectedAttachments: Attachment[];
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isPreview: boolean;
}

// Hook to manage file preview and download logic
export const useFilePreview = (): UseFilePreviewReturn => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<Attachment | null>(null);
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>(
    []
  );
  const [isPreview, setIsPreview] = useState<boolean>(false);

  const downloadFile = useCallback((attachment: Attachment) => {
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
    (attachment: Attachment, isPreview: boolean) => {
      // Ensure the attachment exists and has a valid URL
      if (!attachment || !attachment.url) {
        toast.error("Unable to open file. Invalid attachment.");
        return;
      }

      // Update the preview mode based on the passed isPreview argument
      setIsPreview(isPreview);

      // Handle images and videos for previewing
      if (attachment.type === "image" || attachment.type === "video") {
        setCurrentFile(attachment); // Set the current file for preview
        setIsViewerOpen(true); // Open the viewer
      }
      // Future-proof: Add more types if needed (e.g., PDFs)
      else {
        downloadFile(attachment);
      }
    },
    [downloadFile, setCurrentFile, setIsViewerOpen]
  );

  // Function to handle closing the file viewer
  const closeFileViewer = () => {
    setIsViewerOpen(false);
    setCurrentFile(null);
  };

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

  const clearAttachments = () => {
    setSelectedAttachments((prev) => {
      // Revoke all object URLs before clearing
      prev.forEach((attachment) => {
        URL.revokeObjectURL(attachment.url);
      });

      // Clear all attachments
      return [];
    });
  };

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
              return;
            }

            // Return the Attachment object with the file stored locally
            return {
              file: file, // Keep the file locally on the client side
              url: URL.createObjectURL(file), // Temporary URL for preview
              type: fileType,
              fileName: file.name,
              size: file.size,
              thumbnail:
                fileType === "image" ? URL.createObjectURL(file) : undefined, // Only for images
            };
          })
          .filter((item) => item !== undefined && item !== null); // Filter out null and undefined entries from unsupported extensions
        // Add the valid attachments to the state
        addAttachments(fileArray);

        // Open the viewer with the first selected file, if any
        if (fileArray.length > 0) {
          openFileViewer(fileArray[0], true);
        }
      }
    },
    [addAttachments, openFileViewer]
  );

  return {
    isViewerOpen,
    currentFile,
    openFileViewer,
    closeFileViewer,
    downloadFile,
    setCurrentFile,
    addAttachments,
    removeAttachment,
    clearAttachments,
    selectedAttachments,
    handleFileSelect,
    isPreview,
  };
};
