// MessageStatusIcon.tsx

import React from "react";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { IMessage } from "../../models/dataModels";
import { User } from "../../models/entityModels";

interface MessageStatusIconProps {
  message: IMessage;
  chatType: string;
  participantsData: Partial<User>[];
  isOwnMessage: boolean;
  isSimpleChatRead: boolean;
  isGroupRead: boolean;
}

const MessageStatusIcon: React.FC<MessageStatusIconProps> = ({
  message,
  chatType,
  isOwnMessage,
  isSimpleChatRead,
  isGroupRead,
}) => {



  const getMessageStatusIcon = () => {
    if (message.status === "pending")
      return <DoneIcon sx={{ color: "gray", fontSize: "1.2rem" }} />;
    if (message.status === "sent")
      return <DoneAllIcon sx={{ color: "gray", fontSize: "1.2rem" }} />;
    if (chatType === "simple" && isSimpleChatRead)
      return <DoneAllIcon sx={{ color: "turquoise" }} />;
    if (chatType !== "simple" && isGroupRead)
      return <DoneAllIcon sx={{ color: "turquoise" }} />;
    return null;
  };

  return isOwnMessage ? getMessageStatusIcon() : null;
};

export default React.memo(MessageStatusIcon);
