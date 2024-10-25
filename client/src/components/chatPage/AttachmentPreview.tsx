// src/components/AttachmentPreview.tsx

import { Box } from "@mui/material";
import React from "react";
import { Attachment } from "../../models/dataModels";
import AttachmentItem from "./AttachmentItem"; // Import the child component

interface AttachmentPreviewProps {
  attachments: Attachment[]; // Handle multiple attachments
  openFileViewer: (isPreview: boolean, fileName?: string) => void;
  downloadAndStoreFile: (
    file: Attachment,
    onProgress?: (progress: number) => void
  ) => Promise<void>;
  handleSave: (fileName: string) => void;
  isOwnMessage: boolean;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachments,
  openFileViewer,
  downloadAndStoreFile,
  handleSave,
  isOwnMessage,
}) => {
  return (
    <Box>
      {attachments.map((attachment) => (
        <AttachmentItem
          key={`${attachment.chatId}-${attachment.messageId}-${attachment.fileName}`}
          chatId={attachment.chatId!}
          messageLocalId={attachment.messageId!}
          attachmentFileName={attachment.fileName}
          openFileViewer={openFileViewer}
          downloadAndStoreFile={downloadAndStoreFile}
          handleSave={handleSave}
          isOwnMessage={isOwnMessage}
        />
      ))}
    </Box>
  );
};

export default React.memo(AttachmentPreview);
