/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/userPage/EntityDetails.tsx

import {
  Avatar,
  Box,
  Divider,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { Admin, Agent, Client, Employee } from "../../models/entityModels";

// Define styled components for better maintainability
const CardContainer = styled(Box)(
  ({ theme, isnew }: { theme: any; isnew: string }) => ({
    display: "flex",
    alignItems: "flex-start",
    padding: theme.spacing(2),
    gap: theme.spacing(2),
    backgroundColor:
      isnew === "true" ? "rgba(76,175,80,0.1)" : theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: isnew === "true" ? theme.shadows[4] : theme.shadows[1],
    width: "100%",
    maxWidth: 600,
    transition: "box-shadow 0.3s, background-color 0.3s",
    position: "relative", // For positioning the delete button if needed
  })
);

const EntityInfo = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
}));

const Label = styled(Typography)(({ theme }) => ({
  fontFamily: "'Open Sans', sans-serif",
  color: theme.palette.text.secondary,
  fontSize: "0.9rem",
  fontWeight: 500,
  lineHeight: 1.4,
  marginRight: 5,
}));

const Value = styled(Typography)(({ theme }) => ({
  fontFamily: "'Open Sans', sans-serif",
  color: theme.palette.text.primary,
  fontSize: "1rem",
  fontWeight: 600,
  lineHeight: 1.2,
  marginBottom: theme.spacing(0.5),
}));

// Define the interface for props
interface EntityDetailsProps {
  entity: Client | Agent | Admin | Employee;
  entityType: "client" | "agent" | "admin" | "employee";
}

const EntityDetails: React.FC<EntityDetailsProps> = ({
  entity,
  entityType,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { t } = useTranslation();

  // Helper function to display value or 'N/A'
  const displayValue = (value: any) => {
    if (value === undefined || value === null || value === "") {
      return t("entityDetails.na", "N/A");
    }
    return value;
  };

  // Function to render fields based on entity type
  const renderFields = () => {
    switch (entityType) {
      case "client": {
        const client = entity as Client;
        return (
          <>
            <Box display="flex" alignItems="center">
              <Label>{t("entityDetails.id", "ID")}:</Label>
              <Value sx={{ ml: 0.5 }}>{displayValue(client.id)}</Value>
            </Box>
            <Divider />
            <Box display="flex" alignItems="center">
              <Label>{t("entityDetails.name", "Name")}:</Label>
              <Value sx={{ ml: 0.5 }}>{displayValue(client.name)}</Value>
            </Box>
            <Divider />

            <Box display="flex" alignItems="center">
              <Label>{t("entityDetails.extendedName", "Extended Name")}:</Label>
              <Value sx={{ ml: 0.5 }}>
                {displayValue(client.extendedName)}
              </Value>
            </Box>
            <Divider />

            <Box display="flex" alignItems="center">
              <Label>{t("entityDetails.province", "Province")}:</Label>
              <Value sx={{ ml: 0.5 }}>{displayValue(client.province)}</Value>
            </Box>
            <Divider />

            <Box display="flex" alignItems="center">
              <Label>{t("entityDetails.phone", "Phone")}:</Label>
              <Value sx={{ ml: 0.5 }}>{displayValue(client.phone)}</Value>
            </Box>
            <Divider />

            <Box display="flex" alignItems="center">
              <Label>{t("entityDetails.address", "Address")}:</Label>
              <Value sx={{ ml: 0.5 }}>{displayValue(client.address)}</Value>
            </Box>
            <Divider />

            <Box display="flex" alignItems="center">
              <Label>{t("entityDetails.email", "Email")}:</Label>
              <Value sx={{ ml: 0.5 }}>{displayValue(client.email)}</Value>
            </Box>
            <Divider />

            <Box display="flex" alignItems="center">
              <Label>{t("entityDetails.pec", "PEC")}:</Label>
              <Value sx={{ ml: 0.5 }}>{displayValue(client.pec)}</Value>
            </Box>
            <Divider />

            <Box display="flex" alignItems="center">
              <Label>{t("entityDetails.taxCode", "Tax Code")}:</Label>
              <Value sx={{ ml: 0.5 }}>{displayValue(client.taxCode)}</Value>
            </Box>
            <Divider />

            <Box display="flex" alignItems="center">
              <Label>
                {t("entityDetails.extendedTaxCode", "Extended Tax Code")}:
              </Label>
              <Value sx={{ ml: 0.5 }}>
                {displayValue(client.extendedTaxCode)}
              </Value>
            </Box>
            <Divider />

            <Box display="flex" alignItems="center">
              <Label>
                {t("entityDetails.paymentMethodID", "Payment Method ID")}:
              </Label>
              <Value sx={{ ml: 0.5 }}>
                {displayValue(client.paymentMethodID)}
              </Value>
            </Box>
            <Divider />

            <Box display="flex" alignItems="center">
              <Label>
                {t("entityDetails.paymentMethod", "Payment Method")}:
              </Label>
              <Value sx={{ ml: 0.5 }}>
                {displayValue(client.paymentMethod)}
              </Value>
            </Box>
            <Divider />

            <Box display="flex" alignItems="center">
              <Label>{t("entityDetails.agent", "Agent")}:</Label>
              <Value sx={{ ml: 0.5 }}>{displayValue(client.agent)}</Value>
            </Box>
          </>
        );
      }
      case "agent": {
        const agent = entity as Agent;
        return (
          <>
            {/* Existing Agent Fields */}
            <Box display="flex" alignItems="center">
              <Label>{t("entityDetails.id", "ID")}:</Label>
              <Value sx={{ ml: 0.5 }}>{displayValue(agent.id)}</Value>
            </Box>
            <Divider />

            <Box display="flex" alignItems="center">
              <Label>{t("entityDetails.name", "Name")}:</Label>
              <Value sx={{ ml: 0.5 }}>{displayValue(agent.name)}</Value>
            </Box>
            <Divider />

            <Box display="flex" alignItems="center">
              <Label>{t("entityDetails.email", "Email")}:</Label>
              <Value sx={{ ml: 0.5 }}>{displayValue(agent.email)}</Value>
            </Box>
            <Divider />

            <Box display="flex" alignItems="center">
              <Label>{t("entityDetails.phone", "Phone")}:</Label>
              <Value sx={{ ml: 0.5 }}>{displayValue(agent.phone)}</Value>
            </Box>
            <Divider />

            {/* New Field: Number of Assigned Clients */}
            <Box display="flex" alignItems="center">
              <Label>{t("entityDetails.assignedClients", "Assigned Clients")}:</Label>
              <Value sx={{ ml: 0.5 }}>
                {agent.clients ? agent.clients.length : 0}
              </Value>
            </Box>
            <Divider />
          </>
        );
      }
      case "admin": {
        const admin = entity as Admin;
        return (
          <>
            <Box display="flex" alignItems="center">
              <Label>{t("entityDetails.id", "ID")}:</Label>
              <Value sx={{ ml: 0.5 }}>{displayValue(admin.id)}</Value>
            </Box>
            <Divider />

            <Box display="flex" alignItems="center">
              <Label>{t("entityDetails.name", "Name")}:</Label>
              <Value sx={{ ml: 0.5 }}>{displayValue(admin.name)}</Value>
            </Box>
            <Divider />

            <Box display="flex" alignItems="center">
              <Label>{t("entityDetails.email", "Email")}:</Label>
              <Value sx={{ ml: 0.5 }}>{displayValue(admin.email)}</Value>
            </Box>
          </>
        );
      }
      case "employee": {
        const employee = entity as Employee;
        return (
          <>
            <Box display="flex" alignItems="center">
              <Label>{t("entityDetails.id", "ID")}:</Label>
              <Value sx={{ ml: 0.5 }}>{displayValue(employee.id)}</Value>
            </Box>
            <Divider />

            <Box display="flex" alignItems="center">
              <Label>{t("entityDetails.name", "Name")}:</Label>
              <Value sx={{ ml: 0.5 }}>{displayValue(employee.name)}</Value>
            </Box>
            <Divider />

            <Box display="flex" alignItems="center">
              <Label>{t("entityDetails.email", "Email")}:</Label>
              <Value sx={{ ml: 0.5 }}>{displayValue(employee.email)}</Value>
            </Box>
          </>
        );
      }
      default:
        return null;
    }
  };

  return (
    <CardContainer
      isnew="false" // Adjust based on your logic if needed
      theme={theme}
      sx={{
        borderRadius: 6,
        transform: isMobile ? "scale(0.95)" : "none", // Adjust scaling as needed
        transformOrigin: "top left",
        width: isMobile ? "100%" : "100%",
      }}
    >
      {/* Entity Avatar - Optional, customize based on entity type if needed */}
      <Avatar
        src="/default-avatar.png" // Replace with dynamic avatar if available
        alt={
          t("entityDetails.avatarAlt", "Avatar for") +
          ` ${displayValue(entity.name)}`
        }
        sx={{ borderRadius: 2, width: 56, height: 56 }}
      />

      {/* Entity Information */}
      <EntityInfo>{renderFields()}</EntityInfo>

      {/* Additional Actions (e.g., Delete) can be added here if needed */}
      {/* For now, it's omitted as per your request */}
    </CardContainer>
  );
};

export default EntityDetails;
