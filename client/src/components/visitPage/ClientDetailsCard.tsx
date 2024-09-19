// src/components/visitPage/ClientDetailsCard.tsx
import AirplaneTicketIcon from "@mui/icons-material/AirplaneTicket";
import CloseIcon from "@mui/icons-material/Close";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
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
    color: "black",
    fontWeight: 400,
    fontSize: subtitleFontSize,
    lineHeight: 1.4,
    marginBottom: "0.3rem",
  },
  highlight: {
    fontFamily: fontFamily,
    color: "black",
    fontSize: titleFontSize,
    lineHeight: 1.2,
    fontWeight: 600,
    marginBottom: "0.5rem",
  },
};

interface ClientDetailsCardProps {
  clientId: string;
  onCreateVisit: () => void; // New prop
  onDeselectClient: () => void; // New prop
}

const ClientDetailsCard: React.FC<ClientDetailsCardProps> = ({
  clientId,
  onCreateVisit,
  onDeselectClient,
}) => {
  const client = useAppSelector(
    (state: RootState) => state.data.clients[clientId]
  );
  const agents = useAppSelector((state: RootState) => state.data.agents);
  const currentUser = useAppSelector(
    (state: RootState) => state.data.currentUserDetails
  );
  const userRole = currentUser?.role;

  const [openConfirm, setOpenConfirm] = useState(false); // State for confirmation dialog

  if (!client) return null;

  // Find the agent for this client
  const agent = Object.values(agents).find((agent) =>
    agent.clients.some((c) => c.id === client.id)
  );

  return (
    <Box sx={{ m: 2 }}>
      <Card
        sx={{
          p: 2,
          borderRadius: 4,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          height: "100%", // Ensure the card takes full height to position buttons at the bottom
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" alignItems="center" gap={2}>
            {/* Avatar */}
            <Avatar sx={{ width: 48, height: 48 }}>
              {client.name.charAt(0).toUpperCase()}
            </Avatar>

            {/* Client Information */}
            <Box>
              <Typography sx={infoStyles.title}>{client.name}</Typography>
              <Typography sx={infoStyles.subtitle}>
                Code: {client.id}
              </Typography>
              {client.address && (
                <Typography sx={infoStyles.subtitle}>
                  Address: {client.address}
                </Typography>
              )}
              <Typography sx={infoStyles.subtitle}>
                Province: {client.province || "N/A"}
              </Typography>
              {client.email && (
                <Typography sx={infoStyles.subtitle}>
                  Email: {client.email}
                </Typography>
              )}
              {client.phone && (
                <Typography sx={infoStyles.subtitle}>
                  Phone: {client.phone}
                </Typography>
              )}
              {client.paymentMethod && (
                <Typography sx={infoStyles.subtitle}>
                  Payment Method: {client.paymentMethod}
                </Typography>
              )}
              {userRole === "admin" && agent && (
                <Typography sx={infoStyles.subtitle}>
                  Agent: {agent.name}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>

        {/* Action Buttons */}
        <Box sx={{ p: 2 }}>
          <Stack
            direction={{ xs: "row", sm: "row" }}
            spacing={2}
            justifyContent="flex-end"
          >
            <Tooltip title="Create a new visit">
              <IconButton
                onClick={onCreateVisit}
                sx={{
                  backgroundColor: "green",
                  color: "white",
                  "&:hover": { backgroundColor: "darkgreen" },
                  width: { xs: "auto", sm: "auto" }, // Full width on small screens
                }}
                aria-label="Create Visit"
              >
                <AirplaneTicketIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Deselect current client">
              <IconButton
                onClick={() => setOpenConfirm(true)} // Open confirmation dialog
                sx={{
                  backgroundColor: "red",
                  color: "white",
                  "&:hover": { backgroundColor: "darkred" },
                  width: { xs: "auto", sm: "auto" }, // Full width on small screens
                }}
                aria-label="Deselect Client"
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Confirmation Dialog */}
        <Dialog
          open={openConfirm}
          onClose={() => setOpenConfirm(false)}
          aria-labelledby="confirm-deselect-title"
          aria-describedby="confirm-deselect-description"
        >
          <DialogTitle id="confirm-deselect-title">Deselect Client</DialogTitle>
          <DialogContent>
            <DialogContentText id="confirm-deselect-description">
              Are you sure you want to deselect the current client? All unsaved
              changes will be lost.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirm(false)} color="primary">
              Cancel
            </Button>
            <Button
              onClick={() => {
                setOpenConfirm(false);
                onDeselectClient();
              }}
              color="error"
              autoFocus
            >
              Deselect
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </Box>
  );
};

export default ClientDetailsCard;
