// src/components/chatPage/InputBox.tsx

import AttachFileIcon from "@mui/icons-material/AttachFile"; // Import paperclip icon
import SendIcon from "@mui/icons-material/Send";
import TuneIcon from "@mui/icons-material/Tune";

import {
  Box,
  Divider,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectUserRole } from "../../features/auth/authSlice"; // Assuming the selector is defined in the auth slice
import useChatLogic from "../../hooks/useChatsLogic";
import AttachmentModal from "./AttachmentModal";
import MessageTypeModal from "./MessageTypeModal";
import { Attachment } from "../../models/dataModels";

interface InputBoxProps {
  canUserChat: boolean;
  attachments?: Attachment[];
  viewingFiles?: boolean;
  handleFileSelect?:
    | ((event: ChangeEvent<HTMLInputElement>) => void)
    | undefined; // New prop
  closeFileViewer: (isPreview: boolean) => void; // New prop
  isPreview: boolean; // New prop
}
/**
 * InputBox Component
 * Allows users to input and send messages, and select message types.
 *
 * @param {InputBoxProps} props - Component props.
 * @returns {JSX.Element} The rendered component.
 */
const InputBox: React.FC<InputBoxProps> = ({
  canUserChat,
  attachments,
  viewingFiles,
  handleFileSelect, // Destructure the new props
  closeFileViewer, // Destructure the new props
  isPreview, // Destructure the new props
}) => {
  const { t } = useTranslation();
  const [messageInput, setMessageInput] = useState("");
  const [messageType, setMessageType] = useState<
    "message" | "alert" | "promo" | "visit"
  >("message");
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [attachmentAnchorEl, setAttachmentAnchorEl] =
    useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchorEl);
  const isAttachmentOpen = Boolean(attachmentAnchorEl);

  const { handleSendMessage } = useChatLogic();
  const userRole = useSelector(selectUserRole); // Get the user role from Redux
  const inputRef = useRef<HTMLInputElement | null>(null); // Ref for the input to retain focus
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Add this useEffect to reset attachmentAnchorEl when viewingFiles changes
  useEffect(() => {
    if (viewingFiles) {
      setAttachmentAnchorEl(null);
    }
  }, [viewingFiles]);

  const handleSend = useCallback(() => {
    if (messageInput.trim()) {
      handleSendMessage(messageInput, messageType, attachments);
      setMessageInput(""); // Clear the input field
      inputRef.current?.focus(); // Keep focus on the input field
    }
    closeFileViewer(isPreview);
  }, [
    messageInput,
    messageType,
    handleSendMessage,
    attachments,
    closeFileViewer,
    isPreview,
  ]);

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

  /**
   * Handler for opening the attachment modal.
   */
  const handleAttachmentOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAttachmentAnchorEl(event.currentTarget);
    },
    []
  );

  /**
   * Handler for closing the attachment modal.
   */
  const handleAttachmentClose = useCallback(() => {
    setAttachmentAnchorEl(null);
  }, []);

  /**
   * Handler for selecting files.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - The file input change event.
   */

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
      {!viewingFiles && (
        <Box sx={{ display: "flex", alignItems: "center", pr: 1 }}>
          {/* Attachment Button */}

              {" "}
              {/* Wrapper span to handle disabled state */}
              <IconButton
                color="primary"
                onClick={handleAttachmentOpen}
                aria-label={t("inputBox.tooltips.attachFile")}
                disabled={!canUserChat}
                sx={{
                  marginRight: 1,
                }}
              >
                <AttachFileIcon />
              </IconButton>


          {/* Message Type Selection */}
          {userRole !== "client" && ( // Show the TuneIcon only if the user is not a client
            <Tooltip title={t("inputBox.tooltips.selectMessageType")}>
              <span>
                {" "}
                {/* Wrapper span to handle disabled state */}
                <IconButton
                  color="primary"
                  onClick={handleMenuOpen}
                  disabled={!canUserChat}
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
              </span>
            </Tooltip>
          )}
        </Box>
      )}

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

      {/* Send Message Button */}
      <Tooltip title={t("inputBox.tooltips.sendMessage")}>
        <span>
          {/* Wrapper span to handle disabled state */}
          <IconButton
            color="primary"
            onClick={handleSend}
            aria-label={t("inputBox.tooltips.sendMessage")}
            disabled={!canUserChat}
          >
            <SendIcon />
          </IconButton>
        </span>
      </Tooltip>

      {/* Attachment Modal */}
      {!isPreview && (
        <AttachmentModal
          anchorEl={attachmentAnchorEl}
          isOpen={isAttachmentOpen}
          onClose={handleAttachmentClose}
          onFileSelect={handleFileSelect}
        />
      )}

      {/* Message Type Menu */}
      <MessageTypeModal
        anchorEl={menuAnchorEl}
        isOpen={isMenuOpen}
        messageType={messageType}
        onClose={handleMenuClose}
        onSelect={handleMessageTypeSelect}
      />
    </Paper>
  );
};

export default React.memo(InputBox);
