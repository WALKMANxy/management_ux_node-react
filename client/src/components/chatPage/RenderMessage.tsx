// RenderMessage.tsx
import { Box } from "@mui/material";
import React from "react";
import { IMessage } from "../../models/dataModels";
import { User } from "../../models/entityModels";
import MessageBubble from "./MessageBubble";
import { isDifferentDay } from "../../utils/chatUtils";
import DateDivider from "./DateDivider";

interface RenderMessageProps {
  messages: IMessage[];
  currentUserId: string;
  chatType: string;
  participantsData: Partial<User>[];
}

const RenderMessages: React.FC<RenderMessageProps> = ({
  messages,
  currentUserId,
  chatType,
  participantsData,
}) => {

  console.log("RenderingMessages rendering now")

  return (
    <Box>
      {messages.map((message, index) => {
        const showDivider =
          index === 0 ||
          isDifferentDay(new Date(message.timestamp), new Date(messages[index - 1].timestamp));

        return (
          <React.Fragment key={message.local_id || message._id}>
            {showDivider && <DateDivider date={new Date(message.timestamp)} />}
            <Box
              sx={{
                display: "flex",
                justifyContent: message.sender === currentUserId ? "flex-end" : "flex-start",
                mb: 2,
              }}
            >
              <MessageBubble
                message={message}
                participantsData={participantsData}
                chatType={chatType}
              />
            </Box>
          </React.Fragment>
        );
      })}
    </Box>
  );
};

export default React.memo(RenderMessages);
