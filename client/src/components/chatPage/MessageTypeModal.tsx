// src/components/chatPage/MessageTypeMenu.tsx

import React from "react";
import {  IconButton, Menu, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

interface MessageTypeModal {
  anchorEl: HTMLElement | null;
  isOpen: boolean;
  messageType: "message" | "alert" | "promo" | "visit";
  onClose: () => void;
  onSelect: (type: "message" | "alert" | "promo" | "visit") => void;
}

const MessageTypeModal: React.FC<MessageTypeModal> = ({
  anchorEl,
  isOpen,
  messageType,
  onClose,
  onSelect,
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
        mt:-2,
      }}
      PaperProps={{
        sx: {
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          minWidth: "100px",
        },
      }}
    >
      {["message", "alert", "promo", "visit"].map((type) => (
        <IconButton
          key={type}
          onClick={() => onSelect(type as "message" | "alert" | "promo" | "visit")}
          color={messageType === type ? "primary" : "default"}
        >
          <Typography variant="button">{t(`inputBox.labels.${type}`)}</Typography>
        </IconButton>
      ))}
    </Menu>
  );
};

export default MessageTypeModal;
