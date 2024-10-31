// src/components/fileViewer/FileGallery.tsx

import DeleteIcon from "@mui/icons-material/Delete";

import { Box, IconButton, Tooltip, useMediaQuery } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { Attachment } from "../../models/dataModels";
import { getIconForFileType } from "../../utils/iconUtils";

interface FileGalleryProps {
  attachments: Attachment[];
  currentFile: Attachment;
  onRemoveFile: (fileName: string) => void;
  setCurrentFile: (file: Attachment | null) => void;
  isPreview: boolean;
}

const FileGallery: React.FC<FileGalleryProps> = ({
  attachments,
  currentFile,
  onRemoveFile,
  setCurrentFile,
  isPreview,
}) => {
  const galleryRef = useRef<HTMLDivElement>(null);

  const isMobile = useMediaQuery("(max-width: 600px)");

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
        gap: "20px",
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
        const isImage = ["image"].includes(file.type);
        return (
          <Box
          key={file.url}
          sx={{
            mt: 1,
            mb: 2,

            width: { xs: 40, sm: 60 },
            height: { xs: 40, sm: 60 },
            borderRadius: "8px",
            overFlowY: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            cursor: "pointer",
            flexShrink: 0,
            scrollSnapAlign: "center",
            transition: "transform 0.2s, border 0.05s",
            transform: isSelected ? "scale(1.1)" : "scale(0.9)",
          }}
          onClick={() => setCurrentFile(file)}
        >
            {/* Display file preview or icon based on file type */}
            {isImage ? (
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
                  zIndex: 2,
                }}
              >
                {getIconForFileType(file.fileName, "large", isMobile ? 50 : 60)}
              </Box>
            )}

            {/* Trash Bin Overlay - Only show if isPreview is true and file is currently selected */}
            {isPreview && isSelected && (
              <Tooltip title="Remove File">
                <IconButton
                  size="large"
                  sx={{
                    position: "absolute",

                    bgcolor: "rgba(255, 255, 255, 0.8)",
                    "&:hover": { bgcolor: "rgba(255, 255, 255, 1)" },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(file.fileName); 
                  }}
                >
                  <DeleteIcon fontSize="small"  />
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
