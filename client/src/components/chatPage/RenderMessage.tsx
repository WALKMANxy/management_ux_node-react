// src/components/chatPage/RenderMessage.tsx

import { Box } from "@mui/material";
import React from "react";
import { Attachment, IMessage } from "../../models/dataModels";
import { User } from "../../models/entityModels";
import { isDifferentDay } from "../../utils/chatUtils";
import DateDivider from "./DateDivider";
import MessageBubble from "./MessageBubble";

interface RenderMessageProps {
  messages: IMessage[];
  currentUserId: string;
  chatType: string;
  participantsData: Partial<User>[];
  openFileViewer: (isPreview: boolean, fileName?: string) => void; // Add this line
  downloadAndStoreFile: (attachment: Attachment) => Promise<void>;
  handleSave: (fileName: string) => void;

  downloadedFiles: Attachment[]

}

/**
 * RenderMessages Component
 * Renders a list of messages, inserting date dividers where necessary.
 *
 * @param {RenderMessageProps} props - Component props.
 * @returns {JSX.Element} The rendered component.
 */
const RenderMessages: React.FC<RenderMessageProps> = ({
  messages = [],
  currentUserId,
  chatType,
  participantsData,
  openFileViewer,
  downloadAndStoreFile,
  handleSave,
  downloadedFiles,

}) => {
  /**
   * Determines whether to show a date divider before the current message.
   *
   * @param {number} index - The current message index.
   * @returns {boolean} Whether to show the date divider.
   */
  const shouldShowDivider = (index: number): boolean => {
    if (index === 0) return true; // Always show divider for the first message
    const currentMessageDate = new Date(messages[index].timestamp);
    const previousMessageDate = new Date(messages[index - 1].timestamp);
    return isDifferentDay(currentMessageDate, previousMessageDate);
  };

  return (
    <Box>
      {messages.map((message, index) => {
        const showDivider = shouldShowDivider(index);

        return (
          <React.Fragment
            key={message.local_id || message._id || `message-${index}`}
          >
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
                openFileViewer={openFileViewer} // Pass the function here
                downloadAndStoreFile={downloadAndStoreFile}
                handleSave={handleSave}
                downloadedFiles={downloadedFiles}
              />
            </Box>
          </React.Fragment>
        );
      })}
    </Box>
  );
};

export default React.memo(RenderMessages);
