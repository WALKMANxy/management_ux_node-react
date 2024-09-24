// src/components/chatPage/MessageStatusIcon.tsx

import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { Tooltip } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { IMessage } from "../../models/dataModels";
import { User } from "../../models/entityModels";

interface MessageStatusIconProps {
  message: IMessage;
  chatType: string;
  participantsData: Partial<User>[];
  isOwnMessage: boolean;
}

/**
 * MessageStatusIcon Component
 * Displays an icon representing the status of a message (sent, delivered, read).
 *
 * @param {MessageStatusIconProps} props - Component props.
 * @returns {JSX.Element | null} The rendered component or null if not applicable.
 */
const MessageStatusIcon: React.FC<MessageStatusIconProps> = ({
  message,
  isOwnMessage,
  chatType,
  participantsData,
}) => {
  const { t } = useTranslation();

  /**
   * Determines the appropriate status icon based on message status and chat type.
   *
   * @returns {JSX.Element | null} The status icon or null.
   */
  const getMessageStatusIcon = () => {
    // Determine if the message has been read by all recipients
    const allRead =
      chatType === "simple"
        ? message.readBy.length === 2 // In simple chats, readBy should include sender and receiver
        : message.readBy.length === participantsData.length - 1; // In group chats, exclude the sender

    if (allRead) {
      return (
        <Tooltip title={t("messageStatus.read")} arrow>
          <DoneAllIcon sx={{ color: "deepskyblue", fontSize: "1.2rem" }} />
        </Tooltip>
      );
    }

    if (message.status === "sent") {
      return (
        <Tooltip title={t("messageStatus.sent")} arrow>
          <DoneAllIcon sx={{ color: "gray", fontSize: "1.2rem" }} />
        </Tooltip>
      );
    }

    if (message.status === "pending") {
      return (
        <Tooltip title={t("messageStatus.pending")} arrow>
          <DoneIcon sx={{ color: "gray", fontSize: "1.2rem" }} />
        </Tooltip>
      );
    }

    return null;
  };

  // Only display the status icon for the user's own messages
  return isOwnMessage ? getMessageStatusIcon() : null;
};

export default React.memo(MessageStatusIcon);
