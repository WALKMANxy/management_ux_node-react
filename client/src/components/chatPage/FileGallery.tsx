// src/components/fileViewer/FileGallery.tsx

import DeleteIcon from "@mui/icons-material/Delete";
import { Box, IconButton, Tooltip, useMediaQuery } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { Attachment, useFilePreview } from "../../hooks/useFilePreview";
import { getIconForFileType } from "../../utils/iconUtils";

interface FileGalleryProps {
  attachments: Attachment[];
  currentFile: Attachment;
  onRemoveFile: (fileName: string) => void;
  setCurrentFile: (file: Attachment | null) => void;
}

const FileGallery: React.FC<FileGalleryProps> = ({
  attachments,
  currentFile,
  onRemoveFile,
  setCurrentFile,
}) => {
  const galleryRef = useRef<HTMLDivElement>(null);

  const isMobile = useMediaQuery("(max-width: 600px)");

  const { isPreview } = useFilePreview();

  useEffect(() => {
    const currentIndex = attachments.findIndex(
      (file) => file.url === currentFile.url
    );
    if (galleryRef.current && currentIndex !== -1) {
      const selectedItem = galleryRef.current.children[
        currentIndex
      ] as HTMLElement;
      selectedItem.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentFile, attachments]);

  return (
    <Box
      ref={galleryRef}
      sx={{
        display: "flex",
        overflowX: "auto",
        gap: "10px",
        padding: "0 10px",
        scrollSnapType: "x mandatory",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        height: "100%",
      }}
    >
      {attachments.map((file) => {
        const isSelected = file.fileName === currentFile.fileName;
        const isImageOrVideo = ["image", "video"].includes(file.type);
        return (
          <Box
            key={file.url}
            sx={{
              width: { xs: 40, sm: 60 }, // Responsive width
              height: { xs: 40, sm: 60 }, // Responsive height
              borderRadius: "8px",
              overFlowY: "hidden",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              cursor: "pointer",
              flexShrink: 0,
              scrollSnapAlign: "center",
              border: isSelected ? "2px solid #1976d2" : "none", // Optional border
              transition: "box-shadow 0.05s, border 0.05s",
            }}
            onClick={() => setCurrentFile(file)}
          >
            {/* Display file preview or icon based on file type */}
            {isImageOrVideo ? (
              <img
                src={file.url}
                alt={file.fileName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "4px",
                }}
              />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                }}
              >
                {getIconForFileType(file.fileName, "large", isMobile ? 50 : 60)}
              </Box>
            )}

            {/* Trash Bin Overlay - Only show if isPreview is true and file is currently selected */}
            {isPreview && isSelected && (
              <Tooltip title="Remove File">
                <IconButton
                  size="small"
                  sx={{
                    position: "absolute",
                    top: -5,
                    right: -5,
                    bgcolor: "rgba(255, 255, 255, 0.8)",
                    "&:hover": { bgcolor: "rgba(255, 255, 255, 1)" },
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering onSelectFile
                    onRemoveFile(file.fileName); // Remove the current selected file
                  }}
                >
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default FileGallery;
