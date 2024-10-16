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
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { Attachment } from "../../hooks/useFilePreview";
import FileGallery from "./FileGallery";
import InputBox from "./InputBox";

interface FileViewerProps {
  onClose: () => void;
  download: (file: Attachment) => void;
  currentFile: Attachment | null;
  removeAttachment: (fileName: string) => void;
  selectedAttachments: Attachment[];
  isPreview: boolean;
  downloadedFiles: Attachment[];
  downloadAndStoreFile: (file: Attachment) => Promise<void>;
  downloadedThumbnails: Attachment[];
  setCurrentFile: (file: Attachment | null) => void;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  closeFileViewer: (preview: boolean) => void;
}

const FileViewer: React.FC<FileViewerProps> = ({
  onClose,
  download,
  currentFile,
  removeAttachment,
  selectedAttachments,
  isPreview,
  downloadedFiles,
  downloadAndStoreFile,
  downloadedThumbnails,
  setCurrentFile,
  closeFileViewer,
}) => {


  const [loading, setLoading] = useState(false); // Track loading state

  const [zoomLevel, setZoomLevel] = useState(1);
  const isImage = currentFile?.type.startsWith("ima");
  const isVideo = currentFile?.type.startsWith("vid");

  const handleZoomIn = () => setZoomLevel((prev) => prev + 0.2);
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(1, prev - 0.2));

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

  if (!currentFile) return null;

  const attachmentsToShow = isPreview
    ? selectedAttachments
    : downloadedThumbnails;

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
      }}
    >
      {/* Main File Viewer Container */}
      <Box
        sx={{
          width: { xs: "90%", sm: "80%", md: "70%" },
          height: { xs: "90%", sm: "80%", md: "70%" },
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
            flexGrow: 1, // Allows the content area to expand
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            position: "relative",
            backgroundColor: "#000",
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
                  }}
                />
              )}

              {isVideo && (
                <video
                  src={currentFile?.url}
                  controls
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    borderRadius: "8px",
                  }}
                />
              )}
            </>
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
                color: "#000",
              }}
            >
              <Typography variant="h6" color="textSecondary">
                {currentFile?.fileName}
              </Typography>
              {/* Only show download and open buttons in view mode */}
              {!isPreview && (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Tooltip title="Download">
                    <IconButton
                      onClick={() => {
                        if (currentFile) {
                          download(currentFile);
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
          )}
        </Box>

        {/* File Gallery */}
        <Box
          sx={{
            py: 2,
            backgroundColor: "#f5f5f5",
            overflowX: "auto",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <FileGallery
            attachments={attachmentsToShow}
            currentFile={currentFile}
            onRemoveFile={removeAttachment}
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
              viewingFiles={true}
              closeFileViewer={closeFileViewer}
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
                onClick={() => {
                  if (currentFile) {
                    download(currentFile);
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
