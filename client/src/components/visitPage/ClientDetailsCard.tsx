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
import { styled } from "@mui/material/styles";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";

// Styled IconButton for Actions
const StyledActionButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
  borderRadius: "50%",
  width: 48,
  height: 48,
}));

// Styled Close Button
const StyledCloseButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: theme.palette.common.white,
  "&:hover": {
    backgroundColor: theme.palette.error.dark,
  },
  borderRadius: "50%",
  width: 48,
  height: 48,
}));

interface ClientDetailsCardProps {
  clientId: string;
  onCreateVisit: () => void;
  onDeselectClient: () => void;
}

const ClientDetailsCard: React.FC<ClientDetailsCardProps> = ({
  clientId,
  onCreateVisit,
  onDeselectClient,
}) => {
  const { t } = useTranslation();

  const client = useAppSelector(
    (state: RootState) => state.data.clients[clientId]
  );
  const agents = useAppSelector((state: RootState) => state.data.agents);
  const currentUser = useAppSelector(
    (state: RootState) => state.data.currentUserDetails
  );
  const userRole = currentUser?.role;

  const [openConfirm, setOpenConfirm] = useState(false); // State for confirmation dialog

  // If client data is not available, render nothing
  if (!client) return null;

  // Find the agent associated with this client
  const agent = Object.values(agents).find((agent) =>
    agent.clients.some((c) => c.id === client.id)
  );

  // Handlers for confirmation dialog
  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleConfirmCancel = () => {
    setOpenConfirm(false);
    onDeselectClient();
  };

  const handleDenyCancel = () => {
    setOpenConfirm(false);
  };
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
            <Avatar sx={{ width: 56, height: 56 }}>
              {client.name.charAt(0).toUpperCase()}
            </Avatar>

            {/* Client Information */}
            <Box>
              <Typography sx={infoStyles.title}>{client.name}</Typography>
              <Typography sx={infoStyles.subtitle}>
                {t("clientDetailsCard.code", "Code")}: {client.id}
              </Typography>
              {client.address && (
                <Typography sx={infoStyles.subtitle}>
                  {t("clientDetailsCard.address", "Address")}: {client.address}
                </Typography>
              )}
              <Typography sx={infoStyles.subtitle}>
                {t("clientDetailsCard.province", "Province")}:{" "}
                {client.province || t("clientDetailsCard.na", "N/A")}
              </Typography>
              {client.email && (
                <Typography sx={infoStyles.subtitle}>
                  {t("clientDetailsCard.email", "Email")}: {client.email}
                </Typography>
              )}
              {client.phone && (
                <Typography sx={infoStyles.subtitle}>
                  {t("clientDetailsCard.phone", "Phone")}: {client.phone}
                </Typography>
              )}
              {client.paymentMethod && (
                <Typography sx={infoStyles.subtitle}>
                  {t("clientDetailsCard.paymentMethod", "Payment Method")}:{" "}
                  {client.paymentMethod}
                </Typography>
              )}
              {userRole === "admin" && agent && (
                <Typography sx={infoStyles.subtitle}>
                  {t("clientDetailsCard.agent", "Agent")}: {agent.name}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
      {/* Action Buttons */}
      {userRole !== "client" && (
        <Box sx={{ p: 2 }}>
          <Stack
            direction={"row"}
            spacing={2}
            justifyContent="flex-end"
            sx={{ pt: 1 }}
          >
            <Tooltip
              title={t(
                "clientDetailsCard.createVisitTooltip",
                "Create a new visit"
              )}
              arrow
            >
              <StyledActionButton
                onClick={onCreateVisit}
                aria-label={t("clientDetailsCard.createVisit", "Create Visit")}
              >
                <AirplaneTicketIcon />
              </StyledActionButton>
            </Tooltip>

            <Tooltip
              title={t(
                "clientDetailsCard.deselectClientTooltip",
                "Deselect current client"
              )}
              arrow
            >
              <StyledCloseButton
                onClick={handleOpenConfirm}
                aria-label={t(
                  "clientDetailsCard.deselectClient",
                  "Deselect Client"
                )}
              >
                <CloseIcon />
              </StyledCloseButton>
            </Tooltip>
          </Stack>
        </Box>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirm}
        onClose={handleDenyCancel}
        aria-labelledby="confirm-deselect-title"
        aria-describedby="confirm-deselect-description"
      >
        <DialogTitle id="confirm-deselect-title">
          {t("clientDetailsCard.cancelDialogTitle", "Deselect Client")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-deselect-description">
            {t(
              "clientDetailsCard.cancelDialogDescription",
              "Are you sure you want to deselect the current client? All unsaved changes will be lost."
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDenyCancel} color="primary">
            {t("clientDetailsCard.no", "No")}
          </Button>
          <Button onClick={handleConfirmCancel} color="error" autoFocus>
            {t("clientDetailsCard.yes", "Yes")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Custom styles for titles and subtitles
const infoStyles = {
  title: {
    fontFamily: "'Open Sans', sans-serif",
    color: "#4d4b5f",
    fontSize: "1.1rem",
    lineHeight: 1.2,
    fontWeight: 600,
    marginBottom: "0.5rem",
  },
  subtitle: {
    fontFamily: "'Open Sans', sans-serif",
    color: "black",
    fontWeight: 400,
    fontSize: "0.85rem",
    lineHeight: 1.4,
    marginBottom: "0.3rem",
  },
  highlight: {
    fontFamily: "'Open Sans', sans-serif",
    color: "black",
    fontSize: "1.1rem",
    lineHeight: 1.2,
    fontWeight: 600,
    marginBottom: "0.5rem",
  },
};

export default ClientDetailsCard;
