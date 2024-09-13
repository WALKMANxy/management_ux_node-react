// NotificationBell.tsx
import { Notifications as NotificationsIcon } from "@mui/icons-material";
import { Badge, Box, IconButton, Modal, Typography } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const NotificationBell: React.FC = () => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <IconButton
        color="inherit"
        onClick={() => setModalOpen(true)}
        sx={{ color: "white" }}
      >
        <Badge badgeContent={4} color="secondary">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="notification-modal-title"
        aria-describedby="notification-modal-description"
      >
        <Box
          sx={{
            position: "relative",
            top: "7%",
            right: "2%",
            width: 250,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography id="notification-modal-title" variant="h6" component="h2">
            {t("notifications")}
          </Typography>
          <Typography id="notification-modal-description" sx={{ mt: 2 }}>
            {t("no_notifications")}
          </Typography>
        </Box>
      </Modal>
    </>
  );
};

export default NotificationBell;
