import { Notifications as NotificationsIcon } from "@mui/icons-material";
import {
  Badge,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Popover,
  Typography,
} from "@mui/material";
import { keyframes } from "@mui/system";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useChatLogic from "../../hooks/useChatsLogic"; // Import the custom hook
import { formatDateForDivider } from "../../utils/chatUtils";

const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  50% { transform: translateX(2px); }
  75% { transform: translateX(-2px); }
`;

const NotificationBell: React.FC = () => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { getUnreadChats, getChatTitle, handleSelectChat, currentChat } =
    useChatLogic();

  // Get sorted unread chats and filter out the current chat
  const unreadChats = getUnreadChats().filter(
    (chat) => chat._id !== currentChat?._id
  );

  const handleBellClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget); // Anchor the popover to the bell icon
  };

  const handleChatClick = (chatId: string) => {
    handleSelectChat(chatId); // Select chat using the handler from the hook
    setAnchorEl(null);
    navigate("/messages"); // Navigate to the chat view page
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleBellClick}
        sx={{
          color: "white",
          "&:hover": {
            animation: `${shakeAnimation} 0.3s ease-in-out`,
          },
        }}
      >
        <Badge
          badgeContent={unreadChats.length}
          color="secondary"
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: unreadChats.length > 0 ? "red" : "inherit", // Set to red if there are unread notifications
            },
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        disableScrollLock={true} // Prevent scroll lock issues
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            backdropFilter: "blur(10px)", // Frosted glass effect
            backgroundColor: "rgba(255, 255, 255, 0.4)", // Semi-transparent background
            borderRadius: "8px",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" component="h2">
            {t("notifications")}
          </Typography>
          <Divider sx={{ my: 1 }} />
          {unreadChats.length > 0 ? (
            <List>
              {unreadChats.map((chat, index) => (
                <React.Fragment key={chat._id}>
                  <ListItem
                    button
                    onClick={() => handleChatClick(chat._id)}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.4)",
                      borderRadius: "8px"
                    }}
                  >
                    <ListItemText
                      primary={getChatTitle(chat)}
                      secondary={
                        chat.messages[chat.messages.length - 1]?.content.slice(
                          0,
                          50
                        ) || t("no_messages")
                      }
                      sx={{ flex: 1 }}
                    />
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ minWidth: "100px", textAlign: "right", ml: 1 }}
                    >
                      {formatDateForDivider(
                        chat.messages[chat.messages.length - 1]?.timestamp
                      )}
                    </Typography>
                  </ListItem>
                  {index < unreadChats.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography sx={{ mt: 2 }}>{t("no_notifications")}</Typography>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;
