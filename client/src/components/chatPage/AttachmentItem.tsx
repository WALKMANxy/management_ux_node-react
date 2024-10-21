// src/components/AttachmentItem.tsx

import CloudUploadIcon from "@mui/icons-material/CloudUpload"; // Import Upload Icon
import DownloadIcon from "@mui/icons-material/Download";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ReplayIcon from "@mui/icons-material/Replay"; // Already imported
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
import { retryFailedAttachmentsThunk } from "../../features/chat/chatThunks";
import { selectDownloadedFiles } from "../../features/downloads/downloadedFilesSlice";
import { Attachment } from "../../models/dataModels";
import { formatFileSize } from "../../utils/chatUtils";
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
  isOwnMessage: boolean;
}

const AttachmentItem: React.FC<AttachmentItemProps> = ({
  chatId,
  messageLocalId,
  attachmentFileName,
  openFileViewer,
  downloadAndStoreFile,
  handleSave,
  isOwnMessage,
}) => {
  const dispatch = useAppDispatch();
  const downloadedFiles = useAppSelector(selectDownloadedFiles);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true); // For images and videos
  const [downloadError, setDownloadError] = useState<boolean>(false); // New state to track download errors

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
      latestAttachment?.status === "uploaded" &&
      latestAttachment.url.startsWith("https://")
    ) {
      if (latestAttachment.type === "image") {
        // Auto-download images
        downloadAndStoreFile(latestAttachment, (progress: number) => {
          setDownloadProgress(progress);
        })
          .then(() => {
            setIsLoading(false); // Image is ready
            setDownloadError(false); // Reset download error on success
          })
          .catch(() => {
            setIsLoading(false); // Handle download failure
            setDownloadError(true); // Set download error to true
            toast.error(`Failed to download ${latestAttachment.fileName}.`);
          });
      } else if (isOwnMessage) {
        // Auto-download files uploaded by the user (e.g., videos)
        downloadAndStoreFile(latestAttachment, (progress: number) => {
          setDownloadProgress(progress);
        })
          .then(() => {
            setIsLoading(false); // Download is complete
            setDownloadError(false); // Reset download error on success
          })
          .catch(() => {
            setIsLoading(false); // Handle download failure
            setDownloadError(true); // Set download error to true
            toast.error(`Failed to download ${latestAttachment.fileName}.`);
          });
      } else {
        // For other files (e.g., PDFs, documents)
        setIsLoading(false);
      }
    } else if (
      latestAttachment?.status === "uploaded" &&
      latestAttachment.url.startsWith("blob:")
    ) {
      // Blob URL is ready (for images or videos)
      setIsLoading(false);
    }
  }, [latestAttachment, downloadAndStoreFile, isOwnMessage]);

  const isDownloading = downloadProgress > 0 && downloadProgress < 100;

  // Handle downloading a file manually
  const handleDownload = async () => {
    if (latestAttachment) {
      setIsLoading(true); // Start loading
      setDownloadError(false); // Reset download error before attempting
      await downloadAndStoreFile(latestAttachment, (progress: number) => {
        setDownloadProgress(progress);
      })
        .then(() => {
          setIsLoading(false); // Download complete
          setDownloadError(false); // Reset download error on success
        })
        .catch(() => {
          setIsLoading(false); // Handle download failure
          setDownloadError(true); // Set download error to true
          toast.error(`Failed to download ${latestAttachment.fileName}.`);
        });
    }
  };

  // Handle saving to device
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

  // Handle retrying upload
  const handleRetry = useCallback(() => {
    console.log("Retrying attachment:", latestAttachment!.fileName);
    if (!latestAttachment?.chatId || !latestAttachment?.messageId) {
      console.error("Missing chatId or messageId for the attachment.");
      toast.error("Cannot retry upload: Missing chat or message information.");
      return;
    }

    dispatch(
      retryFailedAttachmentsThunk({
        chatId: latestAttachment.chatId,
        messageLocalId: latestAttachment.messageId,
      })
    )
      .unwrap()
      .then(() => {
        console.log(
          `Attachment ${latestAttachment.fileName} retried successfully.`
        );
        toast.success(
          `Attachment ${latestAttachment.fileName} re-uploaded successfully.`
        );
      })
      .catch((error) => {
        console.error(
          `Failed to retry attachment ${latestAttachment.fileName}:`,
          error
        );
        toast.error(
          `Failed to re-upload attachment ${latestAttachment.fileName}. Please try again.`
        );
      });
  }, [dispatch, latestAttachment]);

  // Handle retrying download
  const handleRetryDownload = async () => {
    if (latestAttachment) {
      setDownloadError(false); // Reset download error before retrying
      setIsLoading(true); // Start loading
      await downloadAndStoreFile(latestAttachment, (progress: number) => {
        setDownloadProgress(progress);
      })
        .then(() => {
          setIsLoading(false); // Download complete
          setDownloadError(false); // Reset download error on success
        })
        .catch(() => {
          setIsLoading(false); // Handle download failure
          setDownloadError(true); // Set download error to true
          toast.error(`Failed to download ${latestAttachment.fileName}.`);
        });
    }
  };

  const getMediaSrc = () => {
    const downloadedFile = downloadedFiles.find(
      (file) => file.fileName === latestAttachment?.fileName
    );
    if (downloadedFile) {
      return downloadedFile.url;
    }
  };

  const handleClick = () => {
    if (isFileDownloaded()) {
      openFileViewer(false, latestAttachment?.fileName);
    }
  };

  // Handle click on the video to open viewer
  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.preventDefault();
    e.stopPropagation();
    openFileViewer(false, latestAttachment?.fileName);
  };

  // Inside your component
  useEffect(() => {
    console.log(
      "Latest Attachment upload status:",
      latestAttachment?.status,
      latestAttachment?.uploadProgress
    );
  }, [latestAttachment]);

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

      {/* Handling Images and Videos Separately */}
      {latestAttachment?.type === "image" ? (
        <>
          {/* Image Handling */}
          {isLoading ? (
            // Show Skeleton while loading
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
            // Display Image
            <img
              src={getMediaSrc()}
              loading="lazy"
              alt={latestAttachment.fileName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onLoad={() => {
                setTimeout(() => {
                  setIsLoading(false);
                }, 500); // Add a delay of 500ms before removing the loading state
              }}
              onClick={handleClick}
            />
          )}

          {/* Downloading Progress Overlay for Images */}
          {latestAttachment.type === "image" &&
            !isFileDownloaded() &&
            downloadProgress > 0 &&
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

          {/* Download Button for Images */}
          {latestAttachment.type === "image" && isFileDownloaded() && (
            <IconButton
              sx={{
                position: "absolute",
                bottom: 8,
                right: 8,
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleSaveToDevice();
              }}
            >
              <DownloadIcon />
            </IconButton>
          )}
        </>
      ) : latestAttachment?.type === "video" ? (
        <>
          {/* Video Handling */}
          <video
            src={getMediaSrc()}
            controls
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            onLoadedData={() => {
              setTimeout(() => {
                setIsLoading(false);
              }, 500); // Add a delay of 500ms before removing the loading state
            }} // Ensure isLoading is false once video is ready
            onClick={handleVideoClick} // Handle click to open viewer
          />

          {/* Downloading Progress Overlay for Videos */}
          {isDownloading && (
            <CircularProgress
              variant="determinate"
              value={downloadProgress}
              sx={{
                position: "absolute",
                color: "white",
                width: "50px", // Explicit size
                height: "50px", // Explicit size
                boxSizing: "border-box", // Ensures it respects sizing correctly
              }}
            />
          )}

          {/* Conditional Rendering for Buttons */}
          {isOwnMessage ? (
            latestAttachment?.status === "uploading" ? (
              // Show upload icon for own uploads during upload
              <IconButton
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "white",
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                  },
                }}
                disabled
              >
                <CloudUploadIcon /> {/* Display upload icon */}
              </IconButton>
            ) : downloadError ? (
              // Show retry icon if download failed
              <IconButton
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "white",
                  backgroundColor: "rgba(255, 0, 0, 0.3)", // Red background for error
                  "&:hover": {
                    backgroundColor: "rgba(255, 0, 0, 0.5)",
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRetryDownload(); // Retry download
                }}
              >
                <ReplayIcon /> {/* Display retry icon */}
              </IconButton>
            ) : null
          ) : // For received messages, show download button or retry icon based on downloadError
          isOwnMessage ? null : downloadError ? (
            // Show retry icon if download failed
            <IconButton
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "white",
                backgroundColor: "rgba(255, 0, 0, 0.3)", // Red background for error
                "&:hover": {
                  backgroundColor: "rgba(255, 0, 0, 0.5)",
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleRetryDownload(); // Retry download
              }}
            >
              <ReplayIcon /> {/* Display retry icon */}
            </IconButton>
          ) : !isDownloading && !isFileDownloaded() ? (
            // Download Button
            <IconButton
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
            >
              <DownloadIcon />
            </IconButton>
          ) : null}
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
          onClick={() => {
            if (isFileDownloaded()) {
              openFileViewer(false, latestAttachment?.fileName);
            }
          }}
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
          {isOwnMessage ? (
            latestAttachment?.status === "uploading" ? (
              // Show upload icon instead of download icon for own uploads
              <IconButton sx={{ color: "black", ml: "auto" }} disabled>
                <CloudUploadIcon /> {/* Display upload icon */}
              </IconButton>
            ) : latestAttachment?.status === "uploaded" ? (
              // Show checkmark icon after upload completes
              // Save to Device Button
              <IconButton
                sx={{ color: "black", ml: "auto" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveToDevice();
                }}
              >
                <OpenInNewIcon />
              </IconButton>
            ) : downloadError ? (
              // Show retry icon if download failed
              <IconButton
                sx={{ color: "black", ml: "auto" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRetryDownload(); // Retry download
                }}
              >
                <ReplayIcon /> {/* Display retry icon */}
              </IconButton>
            ) : null
          ) : latestAttachment?.status === "uploading" ? (
            // Uploading Progress Indicator for others
            <CircularProgress
              variant="determinate"
              value={latestAttachment.uploadProgress}
              sx={{ color: "gray", ml: 2 }}
              size={20}
            />
          ) : isDownloading ? (
            // Downloading Progress Indicator
            <CircularProgress
              variant="determinate"
              value={downloadProgress}
              sx={{ color: "gray", ml: 2 }}
              size={20}
            />
          ) : downloadError ? (
            // Show retry icon if download failed
            <IconButton
              sx={{ color: "black", ml: "auto" }}
              onClick={(e) => {
                e.stopPropagation();
                handleRetryDownload(); // Retry download
              }}
            >
              <ReplayIcon /> {/* Display retry icon */}
            </IconButton>
          ) : !isDownloading && !isFileDownloaded() ? (
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
            // Save to Device Button
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
    </Box>
  );
};

export default React.memo(AttachmentItem);
