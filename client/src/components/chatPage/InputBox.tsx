// src/components/chatPage/InputBox.tsx

import SendIcon from "@mui/icons-material/Send";
import TuneIcon from "@mui/icons-material/Tune";
import {
  Box,
  Divider,
  IconButton,
  Menu,
  Paper,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectUserRole } from "../../features/auth/authSlice"; // Assuming the selector is defined in the auth slice
import useChatLogic from "../../hooks/useChatsLogic";

interface InputBoxProps {
  canUserChat: boolean; // Add chatStatus prop
}

/**
 * InputBox Component
 * Allows users to input and send messages, and select message types.
 *
 * @param {InputBoxProps} props - Component props.
 * @returns {JSX.Element} The rendered component.
 */
const InputBox: React.FC<InputBoxProps> = ({ canUserChat }) => {
  const { t } = useTranslation();
  const [messageInput, setMessageInput] = useState("");
  const [messageType, setMessageType] = useState<
    "message" | "alert" | "promo" | "visit"
  >("message");
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchorEl);
  const { handleSendMessage } = useChatLogic();
  const userRole = useSelector(selectUserRole); // Get the user role from Redux

  const inputRef = useRef<HTMLInputElement | null>(null); // Ref for the input to retain focus
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  /**
   * Handles sending the message.
   */
  const handleSend = useCallback(() => {
    if (messageInput.trim()) {
      handleSendMessage(messageInput, messageType);
      setMessageInput(""); // Clear the input field
      inputRef.current?.focus(); // Keep focus on the input field
    }
  }, [messageInput, messageType, handleSendMessage]);

  /**
   * Handler for opening the message type dropdown menu.
   *
   * @param {React.MouseEvent<HTMLElement>} event - The click event.
   */
  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  }, []);

  /**
   * Handler for closing the message type dropdown menu.
   */
  const handleMenuClose = useCallback(() => {
    setMenuAnchorEl(null);
  }, []);

  /**
   * Handler for selecting a message type.
   *
   * @param {("message" | "alert" | "promo" | "visit")} type - The selected message type.
   */
  const handleMessageTypeSelect = useCallback(
    (type: "message" | "alert" | "promo" | "visit") => {
      setMessageType(type);
      handleMenuClose();
    },
    [handleMenuClose]
  );

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        alignItems: "center",
        p: 1,
        borderRadius: isMobile ? "0px" : "0px", // Rounded corners for the paper
        mt: 0,
        backdropFilter: "blur(10px)", // Frosted glass effect
        backgroundColor: "rgba(255, 255, 255, 0.7)", // Semi-transparent background
      }}
    >
      {/* Message Input Field */}
      <TextField
        variant="outlined"
        fullWidth
        placeholder={t("inputBox.placeholders.typeMessage")}
        value={messageInput}
        inputRef={inputRef} // Attach the ref to keep focus
        onChange={(e) => setMessageInput(e.target.value)}
        onKeyUp={(e) => e.key === "Enter" && handleSend()}
        autoComplete="off" // Prevents autofill suggestions
        type="search" // Ensures minimal autofill interference
        aria-label={t("inputBox.labels.chatInput")}
        role="textbox"
        inputProps={{
          type: "search",
          inputMode: "text",
          enterKeyHint: "send",
          autoCorrect: "on",
          autoCapitalize: "on",
          spellCheck: "true",
          "data-form-type": "other",
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "1.5em",
            height: "2.9em",
            padding: "0.5em 0.875em",
          },
          "& .MuiInputBase-input": {
            height: "1.25em",
            WebkitAppearance: "none",
            MozAppearance: "none",
          },
          mr: 1, // Margin right to separate from the divider
        }}
        disabled={!canUserChat} // Disable input if chat is pending
      />

      {/* Divider */}
      <Divider
        sx={{ height: "1em", marginLeft: 1, marginRight: 1 }}
        orientation="vertical"
      />

      {/* Message Type Selection */}
      {userRole !== "client" && ( // Show the TuneIcon only if the user is not a client
        <Tooltip title={t("inputBox.tooltips.selectMessageType")}>
          <IconButton
            color="primary"
            onClick={handleMenuOpen}
            aria-label={t("inputBox.tooltips.selectMessageType")}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px",
            }}
          >
            <TuneIcon />
          </IconButton>
        </Tooltip>
      )}

      {/* Send Message Button */}
      <Tooltip title={t("inputBox.tooltips.sendMessage")}>
        <IconButton
          color="primary"
          onClick={handleSend}
          aria-label={t("inputBox.tooltips.sendMessage")}
          disabled={!canUserChat}
        >
          <SendIcon />
        </IconButton>
      </Tooltip>

      {/* Dropdown Menu for setting message type */}
      <Menu
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        PaperProps={{
          sx: {
            backdropFilter: "blur(10px)", // Frosted glass effect
            backgroundColor: "rgba(255, 255, 255, 0.7)", // Semi-transparent background
            borderRadius: "8px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            minWidth: "100px",
          },
        }}
      >
        {/* Message Type Buttons */}
        <Box sx={{ display: "flex",flexDirection: "column", gap: 1 }}>
          <IconButton
            onClick={() => handleMessageTypeSelect("message")}
            color={messageType === "message" ? "primary" : "default"}
            aria-label={t("inputBox.labels.message")}
          >
            <Typography variant="button">
              {t("inputBox.labels.message")}
            </Typography>
          </IconButton>
          <IconButton
            onClick={() => handleMessageTypeSelect("alert")}
            color={messageType === "alert" ? "primary" : "default"}
            aria-label={t("inputBox.labels.alert")}
          >
            <Typography variant="button">
              {t("inputBox.labels.alert")}
            </Typography>
          </IconButton>
          <IconButton
            onClick={() => handleMessageTypeSelect("promo")}
            color={messageType === "promo" ? "primary" : "default"}
            aria-label={t("inputBox.labels.promo")}
          >
            <Typography variant="button">
              {t("inputBox.labels.promo")}
            </Typography>
          </IconButton>
          <IconButton
            onClick={() => handleMessageTypeSelect("visit")}
            color={messageType === "visit" ? "primary" : "default"}
            aria-label={t("inputBox.labels.visit")}
          >
            <Typography variant="button">
              {t("inputBox.labels.visit")}
            </Typography>
          </IconButton>
        </Box>
      </Menu>
    </Paper>
  );
};

export default React.memo(InputBox);
