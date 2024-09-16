// src/components/UserPage/UserAvatar.tsx

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
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { handleLogout } from "../../features/auth/authSlice";
import { selectCurrentUser } from "../../features/users/userSlice";

const UserAvatar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const avatarSrc = currentUser?.avatar || "/default-avatar.png";
  const avatarAlt = currentUser?.entityName || "User Avatar";

  const initiateLogout = () => {
    dispatch(handleLogout());
  };

  // Open popover on avatar click
  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Close popover
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Navigate to the chat page
  const handleChatsClick = () => {
    navigate("/messages");
    handleClose();
  };

  // Navigate to the settings page
  const handleSettingsClick = () => {
    navigate("/settings");
    handleClose();
  };

  // Handle logout action
  const handleLogoutClick = () => {
    initiateLogout();
    navigate("/"); // Redirect to landing page after logout
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
        disableScrollLock={true} // Prevent scroll lock issues
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {currentUser?.entityName || "User"}
          </Typography>
          <List>
            {/* Chats Link */}
            <ListItem button onClick={handleChatsClick}>
              <ListItemIcon>
                <ChatIcon />
              </ListItemIcon>
              <ListItemText primary="Chats" />
            </ListItem>
            <Divider />

            {/* Settings Link */}
            <ListItem button onClick={handleSettingsClick}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>
            <Divider />

            {/* Logout Link */}
            <ListItem button onClick={handleLogoutClick}>
              <ListItemIcon>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Popover>
    </>
  );
};

export default UserAvatar;
