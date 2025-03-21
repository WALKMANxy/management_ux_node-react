//src/components/Header/UserAvatar.tsx
import ChatIcon from "@mui/icons-material/Chat";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Popover,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { handleLogout } from "../../features/auth/authThunks";
import { selectCurrentUser } from "../../features/users/userSlice";

const preloadMessages = () => import("../../pages/common/ChatPage");
const preloadSettings = () => import("../../pages/common/UserPage");

const UserAvatar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const avatarSrc = currentUser?.avatar || "/default-avatar.png";
  const avatarAlt = currentUser?.entityName || "User Avatar";
  const { t } = useTranslation();

  const initiateLogout = () => {
    dispatch(handleLogout());
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChatsClick = () => {
    navigate("/messages");
    handleClose();
  };

  const handleSettingsClick = () => {
    navigate("/settings");
    handleClose();
  };

  const handleLogoutClick = () => {
    initiateLogout();
    navigate("/");
    handleClose();
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleAvatarClick}
        sx={{ color: "white" }}
      >
        <Avatar alt={avatarAlt} src={avatarSrc} />
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        disableScrollLock={true}
        PaperProps={{
          sx: {
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            borderRadius: "8px",
            padding: 2,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {currentUser?.entityName || t("userAvatar.defaultUser", "User")}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {/* Chats Link */}
            <ListItem
              button
              onClick={handleChatsClick}
              sx={{
                boxShadow: 1,
                borderRadius: 2,
                mb: 1,
              }}
              onMouseEnter={preloadMessages}
            >
              <ListItemIcon>
                <ChatIcon />
              </ListItemIcon>
              <ListItemText primary={t("userAvatar.chats", "Chats")} />
            </ListItem>
            <Divider />

            {/* Settings Link */}
            <ListItem
              button
              onClick={handleSettingsClick}
              sx={{
                boxShadow: 1,
                borderRadius: 2,
                mb: 1,
              }}
              onMouseEnter={preloadSettings}
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary={t("userAvatar.settings", "Settings")} />
            </ListItem>
            <Divider />

            {/* Logout Link */}
            <ListItem
              button
              onClick={handleLogoutClick}
              sx={{
                boxShadow: 1,
                borderRadius: 2,
              }}
            >
              <ListItemIcon>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary={t("userAvatar.logout", "Logout")} />
            </ListItem>
          </List>
        </Box>
      </Popover>
    </>
  );
};

export default UserAvatar;
