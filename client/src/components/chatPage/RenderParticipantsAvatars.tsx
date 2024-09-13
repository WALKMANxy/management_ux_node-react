// RenderParticipantsAvatars.tsx
import React from "react";
import { Avatar, Badge } from "@mui/material";
import { User } from "../../models/entityModels";

interface RenderParticipantsAvatarsProps {
  participantsData: Partial<User>[];
  chatType: string; // Add chatType as a prop to control rendering
}

const RenderParticipantsAvatars: React.FC<RenderParticipantsAvatarsProps> = ({
  participantsData,
  chatType,
}) => {
  // Render avatars only if the chat is of type 'group'
  if (chatType !== "group" || participantsData.length === 0) return null;

  const limitedParticipants = participantsData.slice(0, 3);
  const participantAvatars = limitedParticipants.map((participant) => (
    <Avatar
      key={participant?._id}
      src={participant?.avatar}
      sx={{ width: 30, height: 30, ml: -1 }}
    />
  ));

  const remainingParticipants = participantsData.length - 3;

  return (
    <>
      {participantAvatars}
      {remainingParticipants > 0 && (
        <Badge badgeContent={`+${remainingParticipants}`} color="primary" />
      )}
    </>
  );
};

export default React.memo(RenderParticipantsAvatars);
