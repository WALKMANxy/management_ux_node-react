import ArticleIcon from "@mui/icons-material/Article";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { Box, CircularProgress, Typography } from "@mui/material";
import React from "react";
import { Attachment } from "../../hooks/useFilePreview";



interface AttachmentPreviewProps {
  attachment: Attachment;
  isUploading?: boolean;
  uploadProgress?: number;
  onClick: () => void;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachment,
  isUploading = false,
  uploadProgress,
  onClick,
}) => {
  return (
    <Box
      sx={{
        maxWidth: "80vw", // Max width relative to the chat view
        maxHeight: "40vh", // Max height relative to the chat view
        width: "auto", // Width adapts to the content
        height: "auto", // Height adapts to the content
        borderRadius: "8px", // Rounded corners
        border: "1px solid rgba(255, 255, 255, 0.5)", // Faint white border
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Slight shadow for depth
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        flexShrink: 0,
      }}
      onClick={onClick}
    >
      {/* Loading spinner for images and videos */}
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

      {/* Image preview */}
      {attachment.type.startsWith("image/") && (
        <img
          src={attachment.url}
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
      {(attachment.type === "word" || attachment.type === "excel" || attachment.type === "csv") && (
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
    </Box>
  );
};

export default AttachmentPreview;
