import DownloadIcon from "@mui/icons-material/Download"; // Download overlay icon
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  Box,
  CircularProgress,
  IconButton,
  Skeleton,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { selectDownloadedFiles } from "../../features/downloads/downloadedFilesSlice";
import { Attachment } from "../../models/dataModels";
import { formatFileSize, getFileExtension } from "../../utils/chatUtils";
import { getIconForFileType } from "../../utils/iconUtils";

interface AttachmentPreviewProps {
  attachments: Attachment[]; // Handle multiple attachments
  isUploading?: boolean;
  uploadProgress?: number;
  openFileViewer: (isPreview: boolean, fileName?: string) => void; // Update this line
  downloadAndStoreFile: (file: Attachment, onProgress?: (progress: number) => void) => Promise<void>;
  download: (fileName: string) => void;

}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachments,
  uploadProgress,
  openFileViewer,
  downloadAndStoreFile,
  download,
  isUploading,
}) => {
  const downloadedFiles = useAppSelector(selectDownloadedFiles);

  const [downloadProgresses, setDownloadProgresses] = useState<Record<string, number>>({});


  useEffect(() => {
    attachments.forEach((attachment) => {
      if (
        ["image"].includes(attachment.type) &&
        !attachment.file && // Only download if local file is not available
        attachment.url &&
        attachment.url.startsWith("https://") // Ensure it's a valid S3 URL
      ) {
        // Fetch thumbnail for images/videos with progress tracking
        downloadAndStoreFile(attachment, (progress: number) => {
          setDownloadProgresses((prev) => ({
            ...prev,
            [attachment.fileName]: progress,
          }));
        });
      }
    });
  }, [attachments, downloadAndStoreFile]);

  // Handle downloading a file
  const handleDownload = async (attachment: Attachment) => {
    await downloadAndStoreFile(attachment, (progress: number) => {
      setDownloadProgresses((prev) => ({
        ...prev,
        [attachment.fileName]: progress,
      }));
    });
  };

  const handleSave = async (attachment: Attachment) => {
    // Start downloading the file and track progress
    download(attachment.fileName);
  };

  // Check if a file is already downloaded
   const isFileDownloaded = (attachment: Attachment) => {
    return downloadedFiles.some(
      (file) => file.fileName === attachment.fileName
    );
  };

  const handleClick = (attachment: Attachment) => {
    if (isFileDownloaded(attachment)) {
      openFileViewer(false, attachment.fileName); // Use the passed prop
    }
  };

  const getImageSrc = useCallback(
    (attachment: Attachment) => {
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
    },
    [downloadedFiles]
  );



  useEffect(() => {
    console.log("Upload progress:", uploadProgress);
  }, [uploadProgress]);



  // Inside AttachmentPreview component
  useEffect(() => {
    console.log("Download progresses:", downloadProgresses);
  }, [downloadProgresses]);

  return (
    <Box>
      {attachments.map((attachment) => (
        <Box
          key={attachment.fileName}
          sx={{
            maxWidth: "70vw",
            maxHeight: "40vh",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
            cursor: isFileDownloaded(attachment) ? "pointer" : "default",
            position: "relative",
            marginBottom: 1, // Increased spacing between attachments
            display: "flex", // Ensure child elements can take full space
            alignItems: "center",
            justifyContent: "center",
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
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 1000,
                height: "100%",
                width: "100%",
              }}
            >
              <CircularProgress
                variant="determinate"
                value={attachment.uploadProgress || 0}
                sx={{ color: "white" }}
              />
              {/* Add a label to show the progress value */}
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  color: "white",
                  top: "60%",
                }}
              >
                {`${Math.round(attachment.uploadProgress || 0)}%`}
              </Typography>
            </Box>
          )}

          {/* Handling Images and Videos */}
          {["image", "video"].includes(attachment.type) ? (
            <>
              {/* If the file is not downloaded */}
              {!isFileDownloaded(attachment) &&
              attachment.uploadProgress !== 100 ? (
                attachment.type === "image" ? (
                  // Image Skeleton while downloading
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height="100%"
                    sx={{
                      maxWidth: "80vw",
                      minWidth: "40vw",
                      maxHeight: "40vh",
                      minHeight: "40vw",
                    }}
                  />
                ) : (
                  // Mock Video Player
                  <Box
                    sx={{
                      position: "relative",
                      width: "40vw",
                      height: "20vh",
                      backgroundColor: "black",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      maxWidth: "70vw",
                      maxHeight: "40vh",
                    }}
                  >
                    {/* Conditional rendering of download icon or progress */}
                    {downloadProgresses[attachment.fileName] !== undefined &&
                    downloadProgresses[attachment.fileName] < 100 ? (
                      // Download Progress
                      <CircularProgress
                        variant="determinate"
                        value={downloadProgresses[attachment.fileName]}
                        sx={{ color: "white", zIndex: 3 }}
                      />
                    ) : (
                      // Download Icon and Size
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <IconButton
                          sx={{ color: "white" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(attachment);
                          }}
                        >
                          <DownloadIcon />
                        </IconButton>
                        <Typography variant="body2" sx={{ color: "white" }}>
                          {formatFileSize(attachment.size)}
                        </Typography>
                      </Box>
                    )}

                    {/* File Extension */}
                    <Typography
                      variant="caption"
                      sx={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        color: "white",
                      }}
                    >
                      {getFileExtension(attachment.fileName)}
                    </Typography>

                    {/* Mock Seek Bar */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        backgroundColor: "#555",
                      }}
                    />
                  </Box>
                )
              ) : attachment.type === "image" ? (
                // Display Image
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
                // Display Video
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
          ) : (
            // Handling Other File Types
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

              {/* Conditional Rendering for Buttons and Progress */}
              {attachment.status === "uploading" ? (
                // Uploading Progress Indicator
                <CircularProgress
                  variant="determinate"
                  value={attachment.uploadProgress}
                  sx={{ color: "gray", ml: 2 }}
                  size={20}
                />
              ) : downloadProgresses[attachment.fileName] !== undefined &&
                downloadProgresses[attachment.fileName] < 100 ? (
                // Downloading Progress Indicator
                <CircularProgress
                  variant="determinate"
                  value={downloadProgresses[attachment.fileName]}
                  sx={{ color: "gray", ml: 2 }}
                  size={20}
                />
              ) : !isFileDownloaded(attachment) ? (
                // Download Button
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
                // Open File Button
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

          {/* Downloading Progress Overlay for Images */}
          {["image"].includes(attachment.type) &&
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
                  zIndex: 3, // Ensure it's above other elements
                }}
              />
            )}
        </Box>
      ))}
    </Box>
  );
};

export default React.memo(AttachmentPreview);
