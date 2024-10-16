import ArticleIcon from "@mui/icons-material/Article";
import DownloadIcon from "@mui/icons-material/Download"; // Download overlay icon
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import {
  Box,
  CircularProgress,
  IconButton,
  Skeleton,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { Attachment, useFilePreview } from "../../hooks/useFilePreview";

interface AttachmentPreviewProps {
  attachments: Attachment[]; // Handle multiple attachments
  isUploading?: boolean;
  uploadProgress?: number;
  onClick?: (attachment: Attachment) => void; // Optional prop if needed elsewhere
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachments,
  isUploading = false,
  uploadProgress,
  onClick,
}) => {
  const {
    downloadAndStoreFile,
    downloadedFiles,
    openFileViewer,
    download,
    downloadProgresses, // Access download progress
  } = useFilePreview();

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
    download(attachment);
  };

  // Check if a file is already downloaded
  const isFileDownloaded = (attachment: Attachment) => {
    return (
      attachment.file ||
      downloadedFiles.some((file) => file.fileName === attachment.fileName)
    );
  };

  // Determine what happens when the file is clicked
  const handleClick = (attachment: Attachment) => {
    if (isFileDownloaded(attachment)) {
      openFileViewer(false, attachment.fileName);
      if (onClick) onClick(attachment); // Trigger onClick if provided
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
            maxWidth: "80vw",
            maxHeight: "40vh",
            width: "auto",
            height: "auto",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
            cursor: isFileDownloaded(attachment) ? "pointer" : "default",
            position: "relative",
            flexShrink: 0,
            marginBottom: 2, // Spacing between attachments
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
                width: "50%",
                height: "50%",
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

          {/* Image and Video Preview */}
          {["image", "video"].includes(attachment.type) && (
            <>
              {!isFileDownloaded(attachment) ? (
                // Show Skeleton while downloading
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height="100%"
                  sx={{
                    maxWidth: "80vw",
                    minWidth: "200px",
                    maxHeight: "40vh",
                    minHeight: "100px",
                  }}
                />
              ) : // Show the actual image or video once downloaded
              attachment.type === "image" ? (
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
            </>
          )}

          {/* PDF Preview */}
          {attachment.type === "pdf" && (
            <>
              {!isFileDownloaded(attachment) ? (
                // Show Skeleton while downloading
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height="100%"
                  sx={{
                    maxWidth: "80vw",
                    minWidth: "200px",
                    maxHeight: "40vh",
                    minHeight: "100px",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  <PictureAsPdfIcon fontSize="large" />
                </Box>
              )}
            </>
          )}

          {/* Document Preview (Word, Excel, CSV) */}
          {["word", "excel", "csv", "pdf"].includes(attachment.type) && (
            <>
              {!isFileDownloaded(attachment) ? (
                // Show Skeleton while downloading
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height="100%"
                  sx={{
                    maxWidth: "80vw",
                    minWidth: "200px",
                    maxHeight: "40vh",
                    minHeight: "100px",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  <ArticleIcon fontSize="large" />
                </Box>
              )}
            </>
          )}

          {/* Other File Types Handling */}
          {!["image", "video", "pdf", "word", "excel", "csv"].includes(
            attachment.type
          ) && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#f5f5f5",
                borderRadius: "16px",
                padding: "8px",
                flexDirection: "row",
              }}
            >
              {/* File Icon */}
              <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
                <ArticleIcon fontSize="small" />
              </Box>

              {/* File Metadata */}
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="caption" noWrap>
                  {attachment.fileName}
                </Typography>
              </Box>

              {/* Download Button with Progress */}
              {!isFileDownloaded(attachment) ? (
                <IconButton
                  sx={{ color: "white", ml: "auto" }}
                  onClick={() => handleSave(attachment)}
                >
                  <DownloadIcon />
                </IconButton>
              ) : (
                downloadProgresses[attachment.fileName] !== undefined &&
                downloadProgresses[attachment.fileName] < 100 && (
                  <CircularProgress
                    variant="determinate"
                    value={downloadProgresses[attachment.fileName]}
                    sx={{ color: "gray", ml: 2 }}
                    size={20}
                  />
                )
              )}
            </Box>
          )}

          {/* Download Overlay for Images and Videos */}
          {["image", "video"].includes(attachment.type) &&
            !isFileDownloaded(attachment) && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
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
          {["image", "video"].includes(attachment.type) &&
            downloadProgresses[attachment.fileName] !== undefined &&
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
                }}
              />
            )}
        </Box>
      ))}
    </Box>
  );
};

export default React.memo(AttachmentPreview);
