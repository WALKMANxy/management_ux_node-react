// src/components/visitPage/VisitCard.tsx
import { Avatar, Box, Divider, Typography } from "@mui/material";
import { Dayjs } from "dayjs";
import React from "react";
import { useAppSelector } from "../../app/hooks";
import { selectUserById } from "../../features/users/userSlice";

interface VisitCardProps {
  clientId: string;
  type: string;
  reason: string;
  date: Dayjs | null;
  notePublic: string;
  notePrivate?: string; // Optional prop for private notes
  pending: boolean; // Required prop to indicate if the visit is pending
  completed: boolean; // Required prop to indicate if the visit is completed
  visitIssuedBy: string; // Required prop to indicate who issued the visit
  isNew?: boolean; // Optional flag to indicate if this is a new visit
}

const infoStyles = {
  title: {
    fontFamily: "'Open Sans', sans-serif",
    color: "#4d4b5f",
    fontSize: "1.25rem",
    lineHeight: 1.2,
    fontWeight: 600,
    marginBottom: "0.5rem",
    marginRight: "0.2rem",
  },
  subtitle: {
    fontFamily: "'Open Sans', sans-serif",
    color: "#696c6f",
    fontWeight: 500,
    fontSize: "0.9rem",
    lineHeight: 1.4,
    wordBreak: "break-word", // Ensures long text wraps appropriately
  },
};

const VisitCard: React.FC<VisitCardProps> = ({
  clientId,
  type,
  reason,
  date,
  notePublic,
  notePrivate,
  completed,
  visitIssuedBy,
  isNew = false,
}) => {
  // Use the selector to get the user by ID
  const visitIssuer = useAppSelector((state) =>
    selectUserById(state, visitIssuedBy)
  );

  // Fallback if the user is not found
  const issuerName = visitIssuer?.entityName || "Unknown";

  const currentUser = useAppSelector((state) => state.data.currentUserDetails);

  const userRole = currentUser?.role || "client"; // Default to 'client' if role is not defined

  return (
    <Box
      display="flex"
      flexDirection="column"
      p={2}
      m={2}
      gap={1.5}
      bgcolor={isNew ? "#e6f7e6" : "white"}
      borderRadius={4}
      sx={{
        width: "auto", // Full width to ensure responsiveness
        boxShadow: isNew
          ? "0 2px 8px rgba(0, 128, 0, 0.2)"
          : "0 1px 4px rgba(0, 0, 0, 0.1)",
        "@media (min-width: 600px)": {
          flexDirection: "row", // Stack horizontally on larger screens
        },
      }}
    >
      <Avatar sx={{ borderRadius: 3, width: 60, height: 60 }}>
        {clientId.charAt(0).toUpperCase()}
      </Avatar>

      <Box sx={{ flex: "auto" }}>
        <Typography sx={infoStyles.title}>Visit for: {clientId}</Typography>
        <Typography sx={infoStyles.subtitle}>Type: {type}</Typography>
        <Divider sx={{ m: 1 }} />

        <Typography sx={infoStyles.subtitle}>Reason: {reason}</Typography>
        <Divider sx={{ m: 1 }} />

        <Typography sx={infoStyles.subtitle}>
          Date: {date ? date.format("DD/MM/YYYY HH:mm") : "N/A"}
        </Typography>
        <Divider sx={{ m: 1 }} />

        <Typography sx={infoStyles.subtitle}>
          Note: {notePublic || "N/A"}
        </Typography>
        <Divider sx={{ m: 1 }} />

        {userRole !== "client" && notePrivate && (
          <>
            <Divider sx={{ my: 1 }} />
            {/* Private Note */}
            <Typography sx={infoStyles.subtitle}>
              Private Note: {notePrivate}
            </Typography>
          </>
        )}

        <Typography sx={infoStyles.subtitle}>
          Completed: {completed ? "Yes" : "No"}
        </Typography>
        <Divider sx={{ m: 1 }} />

        <Typography sx={infoStyles.subtitle}>
          Issued by: {issuerName}
        </Typography>
        <Divider sx={{ m: 1 }} />
      </Box>
    </Box>
  );
};

export default VisitCard;
