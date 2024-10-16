// src/components/chatPage/AttachmentModal.tsx

import PhotoIcon from "@mui/icons-material/Photo";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import { Box, IconButton, Menu, Tooltip } from "@mui/material";
import React, { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";

interface AttachmentModalProps {
  anchorEl: HTMLElement | null;
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: ((event: ChangeEvent<HTMLInputElement>) => void) | undefined;
}

const AttachmentModal: React.FC<AttachmentModalProps> = ({
  anchorEl,
  isOpen,
  onClose,
  onFileSelect,
}) => {
  const { t } = useTranslation();



  return (
    <Menu
      anchorEl={anchorEl}
      open={isOpen}
      onClose={onClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      sx={{
        mt: -2,
      }}
      PaperProps={{
        sx: {
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255, 255, 255, 0.95)", // Slightly more opaque for better readability
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
px: 1        },
      }}
    >
      {/* Icon buttons for selecting files */}
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
        <Tooltip title={t("inputBox.tooltips.uploadPicture")} arrow>
          <IconButton
            onClick={() => document.getElementById("media-upload")?.click()}
            size="medium"
            sx={{ color: "rgba(0, 0, 255, 0.6)" }}
          >
            <PhotoIcon fontSize="large" />
          </IconButton>
        </Tooltip>

        <Tooltip title={t("inputBox.tooltips.uploadDocument")} arrow>
          <IconButton
            onClick={() => document.getElementById("document-upload")?.click()}
            size="medium"
          >
            <TextSnippetIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Hidden File Inputs */}
      <input
        id="media-upload"
        type="file"
        accept=".png,.jpg,.gif,.jpeg,.webp,.avi,.mov,.mp4,.m4v,.mov,.mpg,.mpeg,.webm,.wmv"
        multiple
        style={{ display: "none" }}
        onChange={onFileSelect}
      />
      <input
        id="document-upload"
        type="file"
        accept=".pdf,.docx,.xlsx,.csv,.doc,.xls,.ppt,.pptx,.key,.ods,.xlsm,.rtf,.tex,.txt,.wpd"
        multiple
        style={{ display: "none" }}
        onChange={onFileSelect}
      />
    </Menu>
  );
};

export default AttachmentModal;
