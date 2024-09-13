// UserAvatar.tsx
import React from "react";
import { Avatar, IconButton } from "@mui/material";

const UserAvatar: React.FC = () => {
  // Placeholder src and alt text; can be modified to use dynamic data later
  const avatarSrc = "/path-to-avatar.jpg";
  const avatarAlt = "Agent Name";

  return (
    <IconButton color="inherit" sx={{ color: "white" }}>
      <Avatar alt={avatarAlt} src={avatarSrc} />
    </IconButton>
  );
};

export default UserAvatar;
