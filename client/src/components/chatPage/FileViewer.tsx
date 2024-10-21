import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { useAppSelector } from "../../app/hooks";
import { selectCurrentChat } from "../../features/chat/chatSlice";
import { Attachment } from "../../models/dataModels";
import { formatFileSize, getFileExtension } from "../../utils/chatUtils";
import { getIconForFileType } from "../../utils/iconUtils";
import FileGallery from "./FileGallery";
import InputBox from "./InputBox";

interface FileViewerProps {
  onClose: () => void;
  handleSave: (fileName: string) => void;
  currentFile: Attachment | null;
  removeAttachment: (fileName: string) => void;
  selectedAttachments: Attachment[];
  isPreview: boolean;
  downloadAndStoreFile: (
    file: Attachment,
    onProgress?: (progress: number) => void
  ) => Promise<void>;
  setCurrentFile: (file: Attachment | null) => void;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  closeFileViewer: (preview: boolean) => void;
  downloadedFiles: Attachment[];
}

const FileViewer: React.FC<FileViewerProps> = ({
  onClose,
  handleSave,
  currentFile,
  removeAttachment,
  selectedAttachments,
  isPreview,
  downloadAndStoreFile,
  setCurrentFile,
  closeFileViewer,
  downloadedFiles,
}) => {
  const currentChat = useAppSelector(selectCurrentChat);
  const isDesktop = useMediaQuery("(min-width:800px)");
  const isTablet = useMediaQuery("(min-width:600px)");
  const currentChatAttachments = useMemo(() => {
    if (currentChat) {
      return currentChat.messages.flatMap(
        (message) => message.attachments || []
      );
    } else {
      return [];
    }
  }, [currentChat]);
  const [loading, setLoading] = useState(false); // Track loading state
  const [zoomLevel, setZoomLevel] = useState(1);
  const isImage = currentFile?.type.startsWith("ima");
  const isVideo = currentFile?.type.startsWith("vid");
  const handleZoomIn = () => setZoomLevel((prev) => prev + 0.2);
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(1, prev - 0.2));
  const [downloadProgresses, setDownloadProgresses] = useState<
    Record<string, number>
  >({});

  const handleCurrentFile = useCallback(
    async (file: Attachment) => {
      if (!isPreview) {
        const downloadedFile = downloadedFiles.find(
          (f) => f.fileName === file.fileName
        );

        if (downloadedFile) {
          setCurrentFile(downloadedFile);
        } else {
          setLoading(true);
          await downloadAndStoreFile(file);
          setLoading(false);
        }
      } else {
        return;
      }
    },
    [isPreview, downloadedFiles, downloadAndStoreFile, setCurrentFile]
  );

  useEffect(() => {
    if (currentFile && (isImage || isVideo)) {
      const fileDownloaded = downloadedFiles.find(
        (file) => file.fileName === currentFile.fileName
      );

      if (!fileDownloaded) {
        handleCurrentFile(currentFile);
      }
    }
  }, [currentFile, downloadedFiles, isImage, isVideo, handleCurrentFile]);

  const handleOpenFile = () => {
    window.open(currentFile?.url, "_blank");
  };

  const isFileDownloaded = (attachment: Attachment) => {
    return downloadedFiles.some(
      (file) => file.fileName === attachment.fileName
    );
  };

  // Function to handle downloading files with progress tracking
  const handleDownloadWithProgress = async (file: Attachment) => {
    // Check if file is already downloaded
    const isDownloaded = downloadedFiles.some(
      (f) => f.fileName === file.fileName
    );

    if (!isDownloaded) {
      try {
        setDownloadProgresses((prev) => ({
          ...prev,
          [file.fileName]: 0,
        }));
        await downloadAndStoreFile(file, (progress: number) => {
          setDownloadProgresses((prev) => ({
            ...prev,
            [file.fileName]: progress,
          }));
        });
      } catch (error) {
        console.error("Download failed:", error);
      }
    }

    // Proceed to download
    handleSave(file.fileName);
  };

  // Function to navigate to the next file
  const navigateNext = () => {
    const currentIndex = attachmentsToShow.findIndex(
      (file) => file.fileName === currentFile?.fileName
    );
    if (currentIndex < attachmentsToShow.length - 1) {
      setCurrentFile(attachmentsToShow[currentIndex + 1]);
    }
  };

  // Function to navigate to the previous file
  const navigatePrev = () => {
    const currentIndex = attachmentsToShow.findIndex(
      (file) => file.fileName === currentFile?.fileName
    );
    if (currentIndex > 0) {
      setCurrentFile(attachmentsToShow[currentIndex - 1]);
    }
  };

  // Configure swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: () => navigateNext(),
    onSwipedRight: () => navigatePrev(),
    trackMouse: true, // Optional: allows swipe with mouse for testing
  });

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

  const attachmentsToShow = useMemo(() => {
    if (isPreview) {
      return selectedAttachments;
    } else {
      // Filter downloaded files and current chat attachments
      const currentChatDownloadedFiles = downloadedFiles.filter(
        (file) => file.chatId === currentChat?._id
      );

      const currentChatNotDownloadedFiles = currentChatAttachments.filter(
        (file) =>
          !currentChatDownloadedFiles.some(
            (downloaded) => downloaded.fileName === file.fileName
          )
      );

      return [...currentChatDownloadedFiles, ...currentChatNotDownloadedFiles];
    }
  }, [
    isPreview,
    selectedAttachments,
    downloadedFiles,
    currentChatAttachments,
    currentChat,
  ]);

  if (!currentFile) return null;

  return (
    <Paper
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%", // Changed from 100vw to 100%
        height: "100%", // Changed from 100vh to 100%
        bgcolor: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(5px)",
        zIndex: 1300,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexGrow: 1,
        mt: isDesktop ? -5 : null,
      }}
      {...handlers}
    >
      {/* Main File Viewer Container */}
      <Box
        sx={{
          width: { xs: "95%", sm: "80%", md: "90%" },
          height: { xs: "90%", sm: "90%", md: "85%" },
          backgroundColor: "#fff",
          position: "relative",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Top Action Bar */}
        <Box
          sx={{
            height: "60px", // Fixed height for consistency
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 10px", // Adjusted padding
            borderBottom: "1px solid #e0e0e0",
            backgroundColor: "#f5f5f5",
          }}
        >
          <IconButton onClick={onClose}>
            <ArrowBackIcon />
          </IconButton>

          {/* Zoom Buttons - Only visible in view mode for images */}
          {isImage && !isPreview && (
            <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Tooltip title="Zoom In">
                <IconButton onClick={handleZoomIn}>
                  <ZoomInIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Zoom Out">
                <IconButton onClick={handleZoomOut}>
                  <ZoomOutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

        {/* Content Area */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            position: "relative",
            backgroundColor: "#000",
            maxHeight: "100%",
            maxWidth: "auto",
            flexGrow: 1,
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              {isImage && (
                <img
                  src={currentFile?.url}
                  alt={currentFile?.fileName}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    transform: `scale(${zoomLevel})`,
                    transition: "transform 0.2s ease",
                    objectFit: "cover",
                  }}
                />
              )}

              {isVideo && isFileDownloaded(currentFile) && (
                <video
                  src={getImageSrc(currentFile)}
                  controls
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    borderRadius: "8px",
                    objectFit: "cover",
                  }}
                />
              )}

              {/* Mock Video Player */}
              {isVideo && !isFileDownloaded(currentFile) && (
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
                  {downloadProgresses[currentFile.fileName] !== undefined &&
                  downloadProgresses[currentFile.fileName] < 100 ? (
                    <CircularProgress
                      variant="determinate"
                      value={downloadProgresses[currentFile.fileName]}
                      sx={{ color: "white", zIndex: 3 }}
                    />
                  ) : (
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
                          handleDownloadWithProgress(currentFile);
                        }}
                      >
                        <DownloadIcon />
                      </IconButton>
                      <Typography variant="body2" sx={{ color: "white" }}>
                        {formatFileSize(currentFile.size)}
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
                    {getFileExtension(currentFile.fileName)}
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
              )}

              {/* Fallback for non-image/video files */}
              {!isImage && !isVideo && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    textAlign: "center",
                    color: "#FFF",
                    padding: 4,
                  }}
                >
                  {getIconForFileType(currentFile.fileName, "large", 120)}
                  <Typography variant="h6">{currentFile.fileName}</Typography>

                  <Typography variant="body2">
                    {formatFileSize(currentFile.size)}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>

        {/* File Gallery */}
        <Box
          sx={{
            py: 2,
            backgroundColor: "#f5f5f5",
            overflowX: "auto",
            borderTop: "1px solid #e0e0e0",
            minHeight: isDesktop ? "100px" : isTablet ? "auto" : "85px",
          }}
        >
          <FileGallery
            attachments={attachmentsToShow}
            currentFile={currentFile}
            setCurrentFile={setCurrentFile}
            onRemoveFile={removeAttachment}
            isPreview={isPreview}
          />
        </Box>

        {/* InputBox (only in preview mode) */}
        {isPreview && (
          <Box
            sx={{
              borderTop: "1px solid #e0e0e0",
              backgroundColor: "#f5f5f5",
            }}
          >
            <InputBox
              isPreview={true}
              canUserChat={true}
              attachments={selectedAttachments}
              closeFileViewer={closeFileViewer}
              viewingFiles={true}
            />
          </Box>
        )}

        {/* Bottom Action Bar (only in view mode) */}
        {!isPreview && (
          <Box
            sx={{
              height: "60px", // Fixed height for consistency
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              borderTop: "1px solid #e0e0e0",
              backgroundColor: "#f5f5f5",
              gap: "10px",
              padding: "0 10px", // Adjusted padding
            }}
          >
            <Tooltip title="Download">
              <IconButton
                onClick={async () => {
                  if (currentFile) {
                    await handleDownloadWithProgress(currentFile);
                  }
                }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Open">
              <IconButton onClick={handleOpenFile}>
                <OpenInNewIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default FileViewer;
