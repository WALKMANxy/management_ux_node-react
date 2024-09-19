// RenderMessage.tsx
import { Box } from "@mui/material";
import React from "react";
import { IMessage } from "../../models/dataModels";
import { User } from "../../models/entityModels";
import { isDifferentDay } from "../../utils/chatUtils";
import DateDivider from "./DateDivider";
import MessageBubble from "./MessageBubble";

interface RenderMessageProps {
  messages: IMessage[];
  currentUserId: string;
  chatType: string;
  participantsData: Partial<User>[];
}

/*   console.log("RenderingMessages rendering now")
 */
// RenderMessage.tsx
const RenderMessages: React.FC<RenderMessageProps> = ({
  messages = [],
  currentUserId,
  chatType,
  participantsData,
}) => {
  return (
    <Box>
      {messages.map((message, index) => {
        const previousMessage = messages[index - 1];

        const showDivider =
          index === 0 ||
          (previousMessage &&
            isDifferentDay(
              new Date(message.timestamp),
              new Date(previousMessage.timestamp)
            ));

        return (
          <React.Fragment key={message.local_id || message._id}>
            {showDivider && message.timestamp && (
              <DateDivider date={new Date(message.timestamp)} />
            )}
            <Box
              sx={{
                display: "flex",
                justifyContent:
                  message.sender === currentUserId ? "flex-end" : "flex-start",
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
