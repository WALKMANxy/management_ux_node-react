import ArticleIcon from "@mui/icons-material/Article";
import DownloadIcon from "@mui/icons-material/Download"; // Download overlay icon
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Attachment, useFilePreview } from "../../hooks/useFilePreview";

interface AttachmentPreviewProps {
  attachments: Attachment[]; // Update to handle multiple attachments
  isUploading?: boolean;
  uploadProgress?: number;
  onClick: (attachment: Attachment) => void; // Pass the attachment for handling clicks
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachments,
  isUploading = false,
  uploadProgress,
  onClick,
}) => {
  const {
    downloadAndStoreFile,
    fetchAndStoreThumbnail,
    downloadedThumbnails,
    downloadedFiles,
    openFileViewer,
  } = useFilePreview();

  const [downloadProgresses, setDownloadProgresses] = useState<{
    [key: string]: number;
  }>({});

  // Automatically fetch thumbnails for image/video files
  useEffect(() => {
    attachments.forEach((attachment) => {
      if (["image", "video"].includes(attachment.type)) {
        // Fetch thumbnail for images/videos
        fetchAndStoreThumbnail(attachment);
      }
    });
  }, [attachments, fetchAndStoreThumbnail]);

  // Handle downloading a file
  const handleDownload = async (attachment: Attachment) => {
    // Start downloading the file and track progress
    setDownloadProgresses((prev) => ({
      ...prev,
      [attachment.fileName]: 0, // Start progress at 0
    }));

    await downloadAndStoreFile(attachment);
  };

  // Check if a file is already downloaded
  const isFileDownloaded = (fileName: string) => {
    return downloadedFiles.some((file) => file.fileName === fileName);
  };

  // Determine what happens when the file is clicked
  const handleClick = (attachment: Attachment) => {
    if (isFileDownloaded(attachment.fileName)) {
      // Pass the fileName to openFileViewer so it knows which file to open
      openFileViewer(false, attachment.fileName); // Open file viewer after download with isPreview = false
    } else {
      handleDownload(attachment); // Trigger download if not already downloaded
    }
  };

  const getThumbnailUrl = (attachment: Attachment) => {
    const thumbnail = downloadedThumbnails.find(
      (thumb) => thumb.fileName === attachment.fileName
    );
    return thumbnail ? thumbnail.url : attachment.url;
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
            cursor: "pointer",
            position: "relative",
            flexShrink: 0,
            marginBottom: 2, // Add spacing between attachments
          }}
          onClick={() => handleClick(attachment)}
        >
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
            <img
              src={getThumbnailUrl(attachment)}
              loading="lazy"
              alt={attachment.fileName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )}

          {/* PDF preview */}
          {attachment.type === "pdf" && (
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

          {/* Document preview */}
          {(attachment.type === "word" ||
            attachment.type === "excel" ||
            attachment.type === "csv") && (
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

          {/* Other file type handling */}
          {!attachment.type.startsWith("image/") &&
            attachment.type !== "pdf" &&
            attachment.type !== "word" &&
            attachment.type !== "excel" &&
            attachment.type !== "csv" && (
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
                  <Typography variant="caption" color="text.secondary">
                    {attachment.type.split("/")[1].toUpperCase()}
                  </Typography>
                </Box>

                {/* Uploading Spinner */}
                {isUploading && (
                  <CircularProgress sx={{ color: "gray", ml: 2 }} size={20} />
                )}
              </Box>
            )}

          {/* Download Overlay */}
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
            {isFileDownloaded(attachment.fileName) ? (
              <IconButton
                sx={{ color: "white" }}
                onClick={() => onClick(attachment)}
              ></IconButton>
            ) : (
              <IconButton
                sx={{ color: "white" }}
                onClick={() => handleDownload(attachment)}
              >
                <DownloadIcon />
              </IconButton>
            )}
          </Box>

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
                }}
              />
            )}
        </Box>
      ))}
    </Box>
  );
};

export default React.memo(AttachmentPreview);
