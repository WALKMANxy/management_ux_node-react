// src/components/fileViewer/FileViewer.tsx

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
import { Attachment, useFilePreview } from "../../hooks/useFilePreview";
import FileGallery from "./FileGallery";
import InputBox from "./InputBox";

interface FileViewerProps {
  onClose: () => void;
}

const FileViewer: React.FC<FileViewerProps> = ({ onClose }) => {
  const {
    download,
    currentFile,
    removeAttachment,
    selectedAttachments,
    isPreview,
    downloadedFiles,
    downloadAndStoreFile,
    downloadedThumbnails,
    setCurrentFile,
  } = useFilePreview();

  const [loading, setLoading] = useState(false); // Track loading state

  const [zoomLevel, setZoomLevel] = useState(1);
  const isImage = currentFile?.type.startsWith("image/");
  const isVideo = currentFile?.type.startsWith("video/");

  const handleZoomIn = () => setZoomLevel((prev) => prev + 0.2);
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(1, prev - 0.2));

  // New function to handle setting the current file based on isPreview status
  const handleCurrentFile = useCallback(
    async (file: Attachment) => {
      if (!isPreview) {
        // If we're not in preview mode, check if the file is already downloaded
        const downloadedFile = downloadedFiles.find(
          (f) => f.fileName === file.fileName
        );

        if (downloadedFile) {
          // File is already downloaded, set the current file
          setCurrentFile(downloadedFile);
        } else {
          // File is not downloaded yet, trigger download and display loading
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

      // If file isn't downloaded, initiate download
      if (!fileDownloaded) {
        handleCurrentFile(currentFile);
      }
    }
  }, [currentFile, downloadedFiles, isImage, isVideo, handleCurrentFile]);

  const handleOpenFile = () => {
    window.open(currentFile?.url, "_blank");
  };

  if (!currentFile) return null;

  // Determine which attachments to pass to FileGallery
  const attachmentsToShow = isPreview
    ? selectedAttachments
    : downloadedThumbnails;

  return (
    <Paper
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        bgcolor: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(5px)", // Add blur effect
        zIndex: 1300, // Ensure it's above other elements
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
            height: "10%", // Ensure it's 10% of the viewer's height
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px",
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
            height: "70%", // 70% height for the file preview area
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            position: "relative",
            backgroundColor: "#000", // Optional: to enhance media display
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

        <Box sx={{ height: "20%" }} />
        {/* File Gallery with Trash Bin Overlay */}
        <FileGallery
          attachments={attachmentsToShow}
          currentFile={currentFile}
          onRemoveFile={removeAttachment} // Pass the removal handler
        />
      </Box>

      {/* Bottom Action Bar */}
      <Box
        sx={{
          height: "10%", // Ensure it's 10% of the viewer's height
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "10px",
          borderTop: "1px solid #e0e0e0",
          backgroundColor: "#f5f5f5",
          gap: "10px",
        }}
      >
        {/* InputBox only appears in preview mode */}
        {isPreview && (
          <InputBox
            canUserChat={true}
            attachments={selectedAttachments}
            viewingFiles={true}
          />
        )}

        {/* Download and Open buttons only appear in view mode */}
        {!isPreview && (
          <Box>
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
