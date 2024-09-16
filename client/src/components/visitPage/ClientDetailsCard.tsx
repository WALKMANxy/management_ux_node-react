import React from "react";
import { Avatar, Box, Card, CardContent, Typography } from "@mui/material";
import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";

// Custom styles for titles and subtitles
const titleFontSize = "1.1rem";
const subtitleFontSize = "0.85rem";
const fontFamily = "'Open Sans', sans-serif";

const infoStyles = {
  title: {
    fontFamily: fontFamily,
    color: "#4d4b5f",
    fontSize: titleFontSize,
    lineHeight: 1.2,
    fontWeight: 600,
    marginBottom: "0.5rem",
  },
  subtitle: {
    fontFamily: fontFamily,
    color: "#696c6f",
    fontWeight: 500,
    fontSize: subtitleFontSize,
    lineHeight: 1.4,
    marginBottom: "0.3rem",
  },
};

interface ClientDetailsCardProps {
  clientId: string;
}

const ClientDetailsCard: React.FC<ClientDetailsCardProps> = ({ clientId }) => {
  const client = useAppSelector(
    (state: RootState) => state.data.clients[clientId]
  );
  const agents = useAppSelector((state: RootState) => state.data.agents);
  const currentUser = useAppSelector(
    (state: RootState) => state.data.currentUserDetails
  );
  const userRole = currentUser?.role;

  if (!client) return null;

  // Find the agent for this client
  const agent = Object.values(agents).find((agent) =>
    agent.clients.some((c) => c.id === client.id)
  );

  return (
    <Card sx={{ m: 2, p: 2, borderRadius: 4, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          {/* Placeholder Avatar with First Letter of Name */}
          <Avatar sx={{ width: 48, height: 48 }}>
            {client.name.charAt(0).toUpperCase()}
          </Avatar>

          {/* Client Information */}
          <Box>
            <Typography sx={infoStyles.title}>{client.name}</Typography>
            <Typography sx={infoStyles.subtitle}>Code: {client.id}</Typography>
            {client.address && (
              <Typography sx={infoStyles.subtitle}>Address: {client.address}</Typography>
            )}
            <Typography sx={infoStyles.subtitle}>
              Province: {client.province || "N/A"}
            </Typography>
            {client.email && (
              <Typography sx={infoStyles.subtitle}>Email: {client.email}</Typography>
            )}
            {client.phone && (
              <Typography sx={infoStyles.subtitle}>Phone: {client.phone}</Typography>
            )}
            {client.paymentMethod && (
              <Typography sx={infoStyles.subtitle}>
                Payment Method: {client.paymentMethod}
              </Typography>
            )}
            {userRole === "admin" && agent && (
              <Typography sx={infoStyles.subtitle}>Agent: {agent.name}</Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ClientDetailsCard;
