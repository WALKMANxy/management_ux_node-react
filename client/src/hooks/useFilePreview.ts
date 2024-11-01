//src/hooks/useFilePreview.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { downloadFileFromS3 } from "../features/data/api/media";
import {
  addDownloadedFile,
  clearDownloadedFiles,
  selectDownloadedFiles,
} from "../features/downloads/downloadedFilesSlice";
import { Attachment } from "../models/dataModels";

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 15;
const MAX_TOTAL_SIZE_MB = 75;

// Hook to manage file preview and download logic
export const useFilePreview = () => {
  const dispatch = useAppDispatch();
  const downloadedFiles = useAppSelector(selectDownloadedFiles);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [currentFile, setCurrentFile] = useState<Attachment | null>(null);
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>(
    []
  );

  const downloadedFilesRef = useRef(downloadedFiles);

  useEffect(() => {
    downloadedFilesRef.current = downloadedFiles;
  }, [downloadedFiles]);

  const downloadAndStoreFile = useCallback(
    async (attachment: Attachment, onProgress?: (progress: number) => void) => {
      if (!attachment.chatId || !attachment.messageId) {
        toast.error("Missing chatId or messageId for the attachment.");
        console.error("Attachment is missing chatId or messageId:", attachment);
        return;
      }

      // console.groupCollapsed(`Downloading file: ${attachment.fileName}`);
      try {
        // console.log(`Download request:`, attachment);

        const blobUrl = await downloadFileFromS3(attachment, (progress) => {
          if (onProgress) {
            onProgress(progress);
          }
        });

        // Ensure blobUrl is valid
        if (!blobUrl) {
          toast.error(
            `Failed to retrieve valid Blob URL for ${attachment.fileName}.`
          );
          console.error(`Invalid Blob URL for file: ${attachment.fileName}`);
          return;
        }

        // console.log(`Download complete:`, blobUrl);

        dispatch(
          addDownloadedFile({
            ...attachment,
            url: blobUrl ?? "",
            file: undefined,
            uploadProgress: 100,
            status: "uploaded",
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

  const handleSave = useCallback(
    (fileName: string) => {
      try {
        // Use the ref to access the latest downloadedFiles
        const currentDownloadedFiles = [...downloadedFilesRef.current];

        const fileToDownload = currentDownloadedFiles.find(
          (file) => file.fileName === fileName
        );

        if (!fileToDownload || !fileToDownload.url) {
          toast.error("File not found or invalid file URL.");
          console.error("File not found with fileName:", fileName);
          return;
        }

        // Create a download link and trigger the download
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
    [] // No dependencies needed as we're using downloadedFilesRef
  );

  const openFileViewer = useCallback(
    (isPreview: boolean, fileName?: string) => {
      /*  console.groupCollapsed("openFileViewer");
      console.log("isPreview:", isPreview);
      console.log("fileName:", fileName);
      console.log("selectedAttachments:", selectedAttachments);
      console.log("downloadedFiles:", downloadedFilesRef.current);
      console.groupEnd(); */

      setIsPreview(isPreview);

      let fileToView;

      if (isPreview) {
        if (selectedAttachments.length === 0) {
          toast.error("No attachments available for preview.");
          return;
        }

        // Check for a specific fileName, otherwise default to the first attachment
        fileToView = fileName
          ? selectedAttachments.find((file) => file.fileName === fileName)
          : selectedAttachments[0];

        if (!fileToView) {
          toast.error("Attachment not found for preview.");
          return;
        }
      } else {
        fileToView = downloadedFilesRef.current.find(
          (file) => file.fileName === fileName
        );

        if (!fileToView) {
          toast.error("File not found in downloadedFiles.");
          console.error(
            "File not found in downloadedFiles with fileName:",
            fileName
          );
          return;
        }
      }

      // Open the viewer with the selected file (for both preview and downloaded files)
      setCurrentFile(fileToView);
      setIsViewerOpen(true);
    },
    [selectedAttachments]
  );

  const addAttachments = useCallback(
    (attachments: Attachment[]) => {
      // Early return if no attachments are provided
      if (attachments.length === 0) return;

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

        // If no unique attachments are found, return early
        if (uniqueAttachments.length === 0) return prev;

        // Return the new list of attachments with the unique ones appended
        return [...prev, ...uniqueAttachments];
      });
    },
    [setSelectedAttachments]
  );

  const removeAttachment = useCallback(
    (fileName: string) => {
      setSelectedAttachments((prev) => {
        const attToRemove = prev.find((att) => att.fileName === fileName);

        if (attToRemove) {
          URL.revokeObjectURL(attToRemove.url);
        } else {
          console.warn(`Attachment with fileName "${fileName}" not found.`);
          return prev; // Return the previous state if not found
        }

        // Return the filtered attachments, removing the one with the matching fileName
        return prev.filter((att) => att.fileName !== fileName);
      });
    },
    [setSelectedAttachments]
  );

  const clearAttachments = useCallback(() => {
    setSelectedAttachments((prev) => {
      if (prev.length === 0) return prev;

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
      setIsPreview(false);
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

        // Check if more than 5 files are selected
        if (selectedFiles.length > MAX_FILES) {
          toast.error("You can select up to 5 files at a time");
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
            const extension = file.name.includes(".")
              ? file.name.split(".").pop()?.toLowerCase()
              : null;

            // If extension is not found or not supported, show an error
            if (!extension) {
              toast.error("Unsupported file type.");
              return null;
            }

            // Determine the file type directly within the returned object
            const fileType: Attachment["type"] = ((): Attachment["type"] => {
              if (["png", "jpg", "jpeg", "gif", "webp"].includes(extension)) {
                return "image";
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
                return "video";
              } else if (["pdf"].includes(extension)) {
                return "pdf";
              } else if (
                ["doc", "docx", "rtf", "wpd", "txt"].includes(extension)
              ) {
                return "word";
              } else if (["xls", "xlsx", "xlsm", "ods"].includes(extension)) {
                return "spreadsheet";
              } else {
                return "other";
              }
            })();

            // Check for empty files (size 0)
            if (file.size === 0) {
              toast.error(`File ${file.name} is empty.`);
              return null;
            }

            // For image and video files, generate a UUID and keep the extension
            let fileName;
            if (fileType === "image" || fileType === "video") {
              const fileId = uuidv4();
              fileName = `${fileId}.${extension}`;
            } else {
              // For other files, sanitize the name and keep the extension
              const sanitizedBaseName = file.name.replace(/\s+/g, "_").trim();
              fileName = sanitizedBaseName;
            }

            // Create a new File object with the modified name
            const newFile = new File([file], fileName, { type: file.type });

            // Create a blob URL for preview and ensure unique file naming
            const blobUrl = URL.createObjectURL(newFile);

            return {
              file: newFile,
              url: blobUrl,
              type: fileType,
              fileName,
              size: newFile.size,
              uploadProgress: 0,
              status: "pending" as Attachment["status"],
            };
          })
          .filter((item) => item !== undefined && item !== null);

        addAttachments(fileArray);
      }
    },
    [addAttachments]
  );

  useEffect(() => {
    if (selectedAttachments.length > 0) {
      // console.log("Opening File Viewer with Attachments:", selectedAttachments);
      openFileViewer(true);
    } else {
      closeFileViewer(true);
    }
  }, [selectedAttachments, openFileViewer, closeFileViewer]);

  return {
    isViewerOpen,
    currentFile,
    openFileViewer,
    closeFileViewer,
    handleSave,
    setCurrentFile,
    addAttachments,
    removeAttachment,
    clearAttachments,
    selectedAttachments,
    handleFileSelect,
    isPreview,
    downloadAndStoreFile,
    clearDownloadedData,
  };
};
