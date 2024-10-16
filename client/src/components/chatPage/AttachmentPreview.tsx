import DownloadIcon from "@mui/icons-material/Download"; // Download overlay icon
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  Box,
  CircularProgress,
  IconButton,
  Skeleton,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { useAppSelector } from "../../app/hooks";
import { selectDownloadedFiles } from "../../features/downloads/downloadedFilesSlice";
import { Attachment } from "../../hooks/useFilePreview";
import { formatFileSize } from "../../utils/chatUtils";
import { getIconForFileType } from "../../utils/iconUtils";

interface AttachmentPreviewProps {
  attachments: Attachment[]; // Handle multiple attachments
  isUploading?: boolean;
  uploadProgress?: number;
  openFileViewer: (isPreview: boolean, fileName?: string) => void; // Update this line
  downloadAndStoreFile: (attachment: Attachment) => Promise<void>;
  download: (fileName: string) => void;
  downloadProgresses: {
    [key: string]: number;
  };
  downloadedFiles: Attachment[];
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachments,
  isUploading = false,
  uploadProgress,
  openFileViewer,
  downloadAndStoreFile,
  download,
  downloadProgresses,
}) => {
  const downloadedFiles = useAppSelector(selectDownloadedFiles);

  useEffect(() => {
    attachments.forEach((attachment) => {
      if (
        ["image", "video"].includes(attachment.type) &&
        !attachment.file // Only download if local file is not available
      ) {
        // Fetch thumbnail for images/videos
        downloadAndStoreFile(attachment);
      }
    });
  }, [attachments, downloadAndStoreFile]);

  // Handle downloading a file
  const handleDownload = async (attachment: Attachment) => {
    // Start downloading the file and track progress
    await downloadAndStoreFile(attachment);
  };

  const handleSave = async (attachment: Attachment) => {
    // Start downloading the file and track progress
    download(attachment.fileName);
  };

  // Check if a file is already downloaded
  const isFileDownloaded = (attachment: Attachment) => {
    return (
      attachment.file ||
      downloadedFiles.some((file) => file.fileName === attachment.fileName)
    );
  };

  const handleClick = (attachment: Attachment) => {
    if (isFileDownloaded(attachment)) {
      openFileViewer(false, attachment.fileName); // Use the passed prop
    }
  };

  const getImageSrc = (attachment: Attachment) => {
    if (attachment.file) {
      return URL.createObjectURL(attachment.file);
    } else {
      const downloadedFile = downloadedFiles.find(
        (file) => file.fileName === attachment.fileName
      );
      if (downloadedFile) {
        return downloadedFile.url;
      } else {
        return attachment.url || ""; // Use the original URL or placeholder
      }
    }
  };

  return (
    <Box>
      {attachments.map((attachment) => (
        <Box
          key={attachment.fileName}
          sx={{
            maxWidth: "40vw",
            maxHeight: "40vh",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
            cursor: isFileDownloaded(attachment) ? "pointer" : "default",
            position: "relative",
            flexShrink: 0,
            marginBottom: 0.5, // Spacing between attachments
            // Removed width and height to ensure consistent sizing
          }}
          onClick={() => handleClick(attachment)}
        >
          {/* Uploading Spinner */}
          {isUploading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "absolute",
                inset: 0, // Ensures full coverage
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 1,
              }}
            >
              {uploadProgress !== undefined ? (
                <CircularProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{ color: "white" }}
                />
              ) : (
                <CircularProgress sx={{ color: "gray", opacity: 0.7 }} />
              )}
            </Box>
          )}

          {/* Images and Videos */}
          {["image", "video"].includes(attachment.type) ? (
            <>
              {!isFileDownloaded(attachment) ? (
                // Show Skeleton while downloading
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height="100%"
                  sx={
                    {
                      // Removed maxWidth, minWidth, maxHeight, and minHeight
                    }
                  }
                />
              ) : attachment.type === "image" ? (
                <img
                  src={getImageSrc(attachment)}
                  loading="lazy"
                  alt={attachment.fileName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <video
                  src={getImageSrc(attachment)}
                  controls
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )}

              {/* Download Overlay for Images and Videos */}
              {!isFileDownloaded(attachment) && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0, // Ensures full coverage
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 2,
                  }}
                >
                  <IconButton
                    sx={{ color: "white" }}
                    onClick={() => handleDownload(attachment)}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Box>
              )}

              {/* Show progress while downloading */}
              {downloadProgresses[attachment.fileName] !== undefined &&
                downloadProgresses[attachment.fileName] < 100 && (
                  <CircularProgress
                    variant="determinate"
                    value={downloadProgresses[attachment.fileName]}
                    sx={{
                      color: "white",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      zIndex: 3, // Ensure it's above other elements
                    }}
                  />
                )}
            </>
          ) : (
            // Other File Types
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
                padding: "8px",
                flexDirection: "row",
                width: "100%",
                maxWidth: "500px",
                cursor: isFileDownloaded(attachment) ? "pointer" : "default",
              }}
              onClick={() => handleClick(attachment)}
            >
              <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
                {getIconForFileType(attachment.fileName, "small", 40)}
              </Box>

              {/* File Metadata */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" noWrap>
                  {attachment.fileName}
                </Typography>
                <Typography variant="body2">
                  {formatFileSize(attachment.size)}
                </Typography>
              </Box>

              {/* Download Button with Progress */}
              {downloadProgresses[attachment.fileName] !== undefined &&
              downloadProgresses[attachment.fileName] < 100 ? (
                <CircularProgress
                  variant="determinate"
                  value={downloadProgresses[attachment.fileName]}
                  sx={{ color: "gray", ml: 2 }}
                  size={20}
                />
              ) : !isFileDownloaded(attachment) ? (
                <IconButton
                  sx={{ color: "black", ml: "auto" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(attachment);
                  }}
                >
                  <DownloadIcon />
                </IconButton>
              ) : (
                <IconButton
                  sx={{ color: "black", ml: "auto" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave(attachment);
                  }}
                >
                  <OpenInNewIcon />
                </IconButton>
              )}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default React.memo(AttachmentPreview);
