// src/components/chatPage/InputBox.tsx
import AttachFileIcon from "@mui/icons-material/AttachFile";
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
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectUserRole } from "../../features/auth/authSlice";
import useChatLogic from "../../hooks/useChatsLogic";
import { Attachment } from "../../models/dataModels";
import AttachmentModal from "./AttachmentModal";
import MessageTypeModal from "./MessageTypeModal";

interface InputBoxProps {
  canUserChat: boolean;
  attachments?: Attachment[];
  viewingFiles?: boolean;
  handleFileSelect?: (event: ChangeEvent<HTMLInputElement>) => void;
  closeFileViewer: (isPreview: boolean) => void;
  isPreview: boolean;
  isViewerOpen?: boolean;
}

interface FormValues {
  messageInput: string;
}

const InputBox: React.FC<InputBoxProps> = ({
  canUserChat,
  attachments,
  viewingFiles,
  handleFileSelect,
  closeFileViewer,
  isPreview,
  isViewerOpen,
}) => {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      messageInput: "",
    },
  });

  const [messageType, setMessageType] = useState<
    "message" | "alert" | "promo" | "visit"
  >("message");
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [attachmentAnchorEl, setAttachmentAnchorEl] =
    useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchorEl);
  const isAttachmentOpen = Boolean(attachmentAnchorEl);

  const { handleSendMessage } = useChatLogic();
  const userRole = useSelector(selectUserRole);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  /**
   * Handler for closing the attachment modal.
   */
  const handleAttachmentClose = useCallback(() => {
    setAttachmentAnchorEl(null);
  }, []);

  // Reset attachmentAnchorEl when viewingFiles changes
  useEffect(() => {
    if (isViewerOpen) {
      handleAttachmentClose();
    }
  }, [isViewerOpen, handleAttachmentClose]);

  const onSubmit = useCallback(
    (data: FormValues) => {
      if (attachments || data.messageInput.trim()) {
        handleSendMessage(data.messageInput, messageType, attachments);
        reset();
        inputRef.current?.focus();
      }
      closeFileViewer(isPreview);
    },
    [
      handleSendMessage,
      messageType,
      attachments,
      reset,
      closeFileViewer,
      isPreview,
    ]
  );


  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  }, []);


  const handleMenuClose = useCallback(() => {
    setMenuAnchorEl(null);
  }, []);


  const handleMessageTypeSelect = useCallback(
    (type: "message" | "alert" | "promo" | "visit") => {
      setMessageType(type);
      handleMenuClose();
    },
    [handleMenuClose]
  );


  const handleAttachmentOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAttachmentAnchorEl(event.currentTarget);
    },
    []
  );

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        alignItems: "center",
        p: 1,
        borderRadius: isMobile ? "0px" : "0px",
        mt: 0,
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
      }}
    >
      {!viewingFiles && (
        <Box sx={{ display: "flex", alignItems: "center", pr: 1 }}>
          {/* Attachment Button */}
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
          {userRole !== "client" && (
            <Tooltip title={t("inputBox.tooltips.selectMessageType")}>
              <span>
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
      <Controller
        name="messageInput"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            variant="outlined"
            fullWidth
            placeholder={t("inputBox.placeholders.typeMessage")}
            inputRef={(e) => {
              field.ref(e);
              inputRef.current = e; 
            }}
            onKeyUp={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                handleSubmit(onSubmit)();
              }
            }}
            autoComplete="off"
            type="search"
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
              mr: 1,
            }}
            disabled={!canUserChat}
          />
        )}
      />

      {/* Divider */}
      <Divider
        sx={{ height: "1em", marginLeft: 1, marginRight: 1 }}
        orientation="vertical"
      />

      {/* Send Message Button */}
      <Tooltip title={t("inputBox.tooltips.sendMessage")}>
        <span>
          <IconButton
            color="primary"
            onClick={handleSubmit(onSubmit)}
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
