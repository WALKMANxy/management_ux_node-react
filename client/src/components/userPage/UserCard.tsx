/* eslint-disable @typescript-eslint/no-explicit-any */
//src/components/userPage/UserCard.tsx
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const CardContainer = styled(Box)(
  ({ theme, isnew }: { theme: any; isnew: string }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2),
    gap: theme.spacing(2),
    backgroundColor:
      isnew === "true" ? "rgba(76,175,80,0.1)" : theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: isnew === "true" ? theme.shadows[4] : theme.shadows[1],
    width: "100%",
    maxWidth: 400,
    transition: "box-shadow 0.3s, background-color 0.3s",
    position: "relative",
  })
);

const UserInfo = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
}));

const Label = styled(Typography)(({ theme }) => ({
  fontFamily: "'Open Sans', sans-serif",
  color: theme.palette.text.secondary,
  fontSize: "0.75rem",
  fontWeight: 500,
  lineHeight: 1.4,
}));

const Value = styled(Typography)(({ theme }) => ({
  fontFamily: "'Open Sans', sans-serif",
  color: theme.palette.text.primary,
  fontSize: "1rem",
  fontWeight: 600,
  lineHeight: 1.2,
  marginBottom: theme.spacing(0.5),
}));

interface UserCardProps {
  email: string;
  avatar?: string;
  details: {
    role?: string;
    code?: string;
    name?: string;
  };
  userId?: string;
  isnew?: string;
  onDeleteUser: (id: string) => void;
}

const UserCard: React.FC<UserCardProps> = React.memo(
  ({ email, avatar, details, userId, isnew = "false", onDeleteUser }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { t } = useTranslation();

    const [open, setOpen] = useState(false);

    const handleDeleteClick = () => {
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
    };

    const handleConfirmDelete = () => {
      if (userId) {
        onDeleteUser(userId);
        setOpen(false);
      } else {
        return;
      }
    };

    return (
      <>
        <CardContainer
          isnew={isnew}
          theme={theme}
          sx={{
            borderRadius: 6,
            transform: isMobile ? "scale(0.75)" : "none",
            transformOrigin: "top left",
            width: isMobile ? "133.33%" : "100%",
          }}
        >
          {/* User Avatar */}
          <Avatar
            src={avatar || "/default-avatar.png"}
            alt={t("userCard.avatarAlt", "Avatar for") + ` ${email}`}
            sx={{ borderRadius: 2, width: 56, height: 56 }}
          />
          {/* User Information */}
          <UserInfo>
            <Tooltip title={email} arrow placement="top">
              <Value>{email}</Value>
            </Tooltip>

            {/* Role */}
            <Box display="flex" alignItems="center">
              <Label>{t("userCard.role", "Role")}:</Label>
              <Typography sx={{ ml: 0.5 }}>
                {details.role || t("userCard.none", "None")}
              </Typography>
            </Box>

            {/* Entity Code */}
            <Box display="flex" alignItems="center">
              <Label>{t("userCard.code", "Code")}:</Label>
              <Typography sx={{ ml: 0.5 }}>
                {details.code || t("userCard.none", "None")}
              </Typography>
            </Box>

            {/* Entity Name */}
            <Box display="flex" alignItems="center">
              <Label>{t("userCard.name", "Name")}:</Label>
              <Typography sx={{ ml: 0.5 }}>
                {details.name || t("userCard.none", "None")}
              </Typography>
            </Box>
          </UserInfo>

          {isnew !== "true" && (
            <IconButton
              onClick={handleDeleteClick}
              sx={{
                position: "absolute",
                bottom: 10,
                right: 10,
                backgroundColor: "rgba(255, 0, 0, 0.1)",
                "&:hover": {
                  backgroundColor: "rgba(255, 0, 0, 0.2)",
                },
              }}
            >
              <DeleteIcon sx={{ color: "rgba(255, 0, 0, 0.7)" }} />
            </IconButton>
          )}
        </CardContainer>

        {/* Confirmation Dialog */}
        <Dialog
          open={open}
          onClose={handleClose}
          PaperProps={{ sx: { borderRadius: 6, p: 2 } }}
        >
          <DialogTitle>
            {t("deleteUser.confirmationTitle", "Confirm Deletion")}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t(
                "deleteUser.confirmationMessage",
                "Are you sure you want to delete this user? This action is irreversible."
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleConfirmDelete}
              sx={{
                color: "black",
                backgroundColor: "rgba(255, 0, 0, 0.1)",
                "&:hover": {
                  backgroundColor: "rgba(255, 0, 0, 0.2)",
                },
              }}
            >
              {t("deleteUser.deleteButton", "Delete User")}
            </Button>
            <Button
              onClick={handleClose}
              sx={{
                color: "black",

                backgroundColor: "rgba(128, 128, 128, 0.1)",
                "&:hover": {
                  backgroundColor: "rgba(128, 128, 128, 0.2)",
                },
              }}
            >
              {t("deleteUser.cancelButton", "Cancel")}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
);

export default UserCard;
