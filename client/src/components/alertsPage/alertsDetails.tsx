// src/components/Alerts/AlertDetails.tsx
import { Avatar, Box, Typography } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { selectAlerts } from "../../features/data/dataSelectors";

const AlertDetails: React.FC = () => {
  const alerts = useSelector(selectAlerts);

  // Logic to select a specific alert group and display its messages

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2 }}>
      {/* Header with Issuer Info */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Avatar src={/* Add selected issuer avatar logic here */} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          {/* Issuer Name */}
        </Typography>
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {alerts.map((alert) => (
          <Box
            key={alert._id}
            sx={{
              display: "flex",
              flexDirection:
                alert.entityRole === "client" ? "row-reverse" : "row",
              mb: 2,
            }}
          >
            <Avatar src={/* Add alert issuer avatar logic here */} />
            <Box
              sx={{
                backgroundColor:
                  alert.severity === "high"
                    ? "rgba(255, 0, 0, 0.2)"
                    : alert.severity === "medium"
                    ? "rgba(255, 255, 0, 0.2)"
                    : "rgba(0, 0, 0, 0.1)",
                borderRadius: 2,
                p: 1,
                maxWidth: "70%",
              }}
            >
              <Typography>{alert.message}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Input Box */}
      {/* Add AlertInput component here */}
    </Box>
  );
};

export default AlertDetails;
