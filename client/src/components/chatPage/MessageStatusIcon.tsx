// MessageStatusIcon.tsx

import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import React from "react";
import { IMessage } from "../../models/dataModels";
import { User } from "../../models/entityModels";

interface MessageStatusIconProps {
  message: IMessage;
  chatType: string;
  participantsData: Partial<User>[];
  isOwnMessage: boolean;
}

const MessageStatusIcon: React.FC<MessageStatusIconProps> = ({
  message,
  isOwnMessage,
  chatType,
  participantsData,
}) => {
  const getMessageStatusIcon = () => {
    // Check read statuses first to avoid early returns from status checks
    if (chatType === "simple" && message.readBy.length === 2) {
      return <DoneAllIcon sx={{ color: "deepskyblue",  fontSize: "1.2rem" }} />;
    }

    if (
      chatType === "group" &&
      message.readBy.length === participantsData.length - 1
    ) {
      return <DoneAllIcon sx={{ color: "deepskyblue",  fontSize: "1.2rem" }} />;
    }



    if (message.status === "sent") {
      return <DoneAllIcon sx={{ color: "gray", fontSize: "1.2rem" }} />;
    }

     // Check message statuses after read status checks
     if (message.status === "pending") {
      return <DoneIcon sx={{ color: "gray", fontSize: "1.2rem" }} />;
    }

    return null;
  };

  return isOwnMessage ? getMessageStatusIcon() : null;
};

export default React.memo(MessageStatusIcon);
