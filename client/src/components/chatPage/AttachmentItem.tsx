// src/components/AttachmentItem.tsx

import DownloadIcon from "@mui/icons-material/Download";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ReplayIcon from "@mui/icons-material/Replay";
import {
  Box,
  CircularProgress,
  IconButton,
  Skeleton,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectAttachment } from "../../features/chat/chatSlice";
import { retryFailedAttachments } from "../../features/chat/chatThunks";
import { selectDownloadedFiles } from "../../features/downloads/downloadedFilesSlice";
import { Attachment } from "../../models/dataModels";
import { formatFileSize, getFileExtension } from "../../utils/chatUtils";
import { getIconForFileType } from "../../utils/iconUtils";

interface AttachmentItemProps {
  chatId: string;
  messageLocalId: string;
  attachmentFileName: string;
  openFileViewer: (isPreview: boolean, fileName?: string) => void;
  downloadAndStoreFile: (
    file: Attachment,
    onProgress?: (progress: number) => void
  ) => Promise<void>;
  handleSave: (fileName: string) => void;
}

const AttachmentItem: React.FC<AttachmentItemProps> = ({
  chatId,
  messageLocalId,
  attachmentFileName,
  openFileViewer,
  downloadAndStoreFile,
  handleSave,
}) => {
  const dispatch = useAppDispatch();
  const downloadedFiles = useAppSelector(selectDownloadedFiles);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  // Select the latest attachment data from Redux
  const latestAttachment = useAppSelector((state) =>
    selectAttachment(state, {
      chatId,
      messageLocalId,
      attachmentFileName,
    })
  );

  useEffect(() => {
    if (
      latestAttachment?.type === "image" &&
      latestAttachment.status === "uploaded" &&
      latestAttachment.url.startsWith("https://")
    ) {
      // Start downloading the file if it's an image and uploaded
      downloadAndStoreFile(latestAttachment, (progress: number) => {
        setDownloadProgress(progress);
      });
    }
  }, [latestAttachment, downloadAndStoreFile]);

  // Handle downloading a file
  const handleDownload = async () => {
    if (latestAttachment) {
      await downloadAndStoreFile(latestAttachment, (progress: number) => {
        setDownloadProgress(progress);
      });
    }
  };

  const handleSaveToDevice = async () => {
    if (latestAttachment) {
      handleSave(latestAttachment.fileName);
    }
  };

  // Check if a file is already downloaded
  const isFileDownloaded = () => {
    return downloadedFiles.some(
      (file) => file.fileName === latestAttachment?.fileName
    );
  };

  const handleClick = () => {
    if (isFileDownloaded()) {
      openFileViewer(false, latestAttachment?.fileName);
    }
  };

  // Retry handler
  const handleRetry = useCallback(() => {
    if (!latestAttachment?.chatId || !latestAttachment?.messageId) {
      console.error("Missing chatId or messageId for the attachment.");
      toast.error("Cannot retry upload: Missing chat or message information.");
      return;
    }

    // Adjust messageId to match the expected argument name `messageLocalId`
    dispatch(
      retryFailedAttachments(
        latestAttachment!.chatId,
        latestAttachment!.messageId // renamed properly
      )
    );
  }, [dispatch, latestAttachment]);

  const getImageSrc = () => {
    const downloadedFile = downloadedFiles.find(
      (file) => file.fileName === latestAttachment?.fileName
    );
    if (downloadedFile) {
      return downloadedFile.url;
    } else {
      return latestAttachment?.url || "";
    }
  };

  // Render different UI based on attachment type and status
  return (
    <Box
      sx={{
        maxWidth: "70vw",
        maxHeight: "40vh",
        borderRadius: "8px",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        cursor: isFileDownloaded() ? "pointer" : "default",
        position: "relative",
        marginBottom: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={handleClick}
    >
      {/* Uploading Progress Overlay */}
      {latestAttachment?.status === "uploading" && (
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
            value={latestAttachment.uploadProgress || 0}
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
            {`${Math.round(latestAttachment.uploadProgress || 0)}%`}
          </Typography>
        </Box>
      )}

      {/* Failure Overlay */}
      {latestAttachment?.status === "failed" && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(255, 0, 0, 0.2)", // Semi-transparent red
            zIndex: 1001, // Ensure it's above the uploading overlay
            color: "white",
            padding: 2,
            textAlign: "center",
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="body2" sx={{ mb: 1 }}>
            Upload failed, please retry
          </Typography>
          <IconButton
            sx={{
              color: "white",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              },
            }}
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the parent onClick
              handleRetry();
            }}
          >
            <ReplayIcon />
          </IconButton>
        </Box>
      )}

      {/* Handling Images and Videos */}
      {["image", "video"].includes(latestAttachment?.type || "") ? (
        <>
          {/* If the file is not downloaded yet and status is not failed */}
          {!isFileDownloaded() && latestAttachment?.status !== "uploaded" ? (
            latestAttachment?.type === "image" ? (
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
                {downloadProgress < 100 ? (
                  // Download Progress
                  <CircularProgress
                    variant="determinate"
                    value={downloadProgress}
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
                        handleDownload();
                      }}
                    >
                      <DownloadIcon />
                    </IconButton>
                    <Typography variant="body2" sx={{ color: "white" }}>
                      {formatFileSize(latestAttachment!.size)}
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
                  {getFileExtension(latestAttachment!.fileName)}
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
          ) : latestAttachment!.type === "image" ? (
            // Display Image
            <img
              src={getImageSrc()}
              loading="lazy"
              alt={latestAttachment!.fileName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            // Display Video
            <video
              src={getImageSrc()}
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
            cursor: isFileDownloaded() ? "pointer" : "default",
          }}
          onClick={handleClick}
        >
          <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
            {getIconForFileType(latestAttachment?.fileName || "", "small", 40)}
          </Box>

          {/* File Metadata */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" noWrap>
              {latestAttachment?.fileName}
            </Typography>
            <Typography variant="body2">
              {formatFileSize(latestAttachment?.size || 0)}
            </Typography>
          </Box>

          {/* Conditional Rendering for Buttons and Progress */}
          {latestAttachment?.status === "uploading" ? (
            // Uploading Progress Indicator
            <CircularProgress
              variant="determinate"
              value={latestAttachment.uploadProgress}
              sx={{ color: "gray", ml: 2 }}
              size={20}
            />
          ) : downloadProgress < 100 ? (
            // Downloading Progress Indicator
            <CircularProgress
              variant="determinate"
              value={downloadProgress}
              sx={{ color: "gray", ml: 2 }}
              size={20}
            />
          ) : !isFileDownloaded() ? (
            // Download Button
            <IconButton
              sx={{ color: "black", ml: "auto" }}
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
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
                handleSaveToDevice();
              }}
            >
              <OpenInNewIcon />
            </IconButton>
          )}
        </Box>
      )}

      {/* Downloading Progress Overlay for Images */}
      {["image"].includes(latestAttachment?.type || "") &&
        downloadProgress < 100 && (
          <CircularProgress
            variant="determinate"
            value={downloadProgress}
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
  );
};

export default React.memo(AttachmentItem);
