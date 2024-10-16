// src/components/fileViewer/FileGallery.tsx

import ArticleIcon from "@mui/icons-material/Article";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { Attachment, useFilePreview } from "../../hooks/useFilePreview";

interface FileGalleryProps {
  attachments: Attachment[];
  currentFile: Attachment;
  onRemoveFile: (fileName: string) => void;
}

const FileGallery: React.FC<FileGalleryProps> = ({
  attachments,
  currentFile,
  onRemoveFile,
}) => {
  const galleryRef = useRef<HTMLDivElement>(null);

  const { setCurrentFile, isPreview } = useFilePreview();

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
        "&::webkitScrollbar": {
          display: "none",
        },
      }}
    >
      {attachments.map((file) => (
        <Box
          key={file.url}
          sx={{
            width: { xs: 40, sm: 60 }, // Responsive width for different screen sizes
            height: { xs: 40, sm: 60 }, // Responsive height for different screen sizes
            borderRadius: "8px", // Slight rounding of the edges
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)", // Slight shadow
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            cursor: "pointer",
            flexShrink: 0, // Ensure the files don't shrink
            scrollSnapAlign: "center",
          }}
          onClick={() => setCurrentFile(file)}
        >
          {/* Display file preview or icon based on file type */}
          {file.type === "image" || file.type === "video" || file.url ? (
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
          ) : file.type === "pdf" ? (
            <PictureAsPdfIcon fontSize="large" />
          ) : file.type === "word" ||
            file.type === "excel" ||
            file.type === "csv" ? (
            <ArticleIcon fontSize="large" />
          ) : (
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                bottom: 2,
                right: 2,
                color: "#fff",
                backgroundColor: "rgba(0,0,0,0.6)",
                borderRadius: "2px",
                padding: "0 2px",
              }}
            >
              {file.type.toUpperCase()}
            </Typography>
          )}

          {/* Trash Bin Overlay - Only show if isPreview is true and file is currently selected */}
          {isPreview && file.url === currentFile.url && (
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
      ))}
    </Box>
  );
};

export default FileGallery;
