// RenderParticipantsAvatars.tsx
import { Avatar, Badge, Box } from "@mui/material";
import React from "react";
import { User } from "../../models/entityModels";

interface RenderParticipantsAvatarsProps {
  participantsData: Partial<User>[];
  chatType: string;
  onClick?: () => void;
}

const RenderParticipantsAvatars = React.forwardRef<
  HTMLDivElement,
  RenderParticipantsAvatarsProps & React.HTMLAttributes<HTMLDivElement>
>(({ participantsData, chatType, ...rest }, ref) => {
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
    <Box ref={ref} {...rest} sx={{ display: "flex", alignItems: "center" }}>
      {participantAvatars}
      {remainingParticipants > 0 && (
        <Badge badgeContent={`+${remainingParticipants}`} color="primary" />
      )}
    </Box>
  );
});

export default React.memo(RenderParticipantsAvatars);
