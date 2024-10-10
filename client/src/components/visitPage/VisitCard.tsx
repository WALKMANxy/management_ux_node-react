import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  Typography,
} from "@mui/material";
import { Dayjs } from "dayjs";
import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  // Use the selector to get the user by ID
  const visitIssuer = useAppSelector((state) =>
    selectUserById(state, visitIssuedBy)
  );

  // Fallback if the user is not found
  const issuerName = visitIssuer?.entityName || t("visitCard.unknown", "Unknown");

  const currentUser = useAppSelector((state) => state.data.currentUserDetails);
  const userRole = currentUser?.role || "client"; // Default to 'client' if role is not defined

  return (
    <Box sx={{ m: 2 }}>
      <Card
        sx={{
          p: 2,
          borderRadius: 4,
          boxShadow: isNew
            ? "0 2px 8px rgba(0, 128, 0, 0.2)"
            : "0 2px 8px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          height: "100%", // Ensure the card takes full height
          bgcolor: isNew ? "#e6f7e6" : "white", // Highlight new visits
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" alignItems="center" gap={2}>
            {/* Avatar */}
            <Avatar sx={{ width: 56, height: 56 }}>
              {clientId.charAt(0).toUpperCase()}
            </Avatar>

            {/* Visit Information */}
            <Box>
              <Typography sx={infoStyles.title}>
                {t("visitCard.visitFor", "Visit for")}: {clientId}
              </Typography>
              <Typography sx={infoStyles.subtitle}>
                {t("visitCard.type", "Type")}: {type}
              </Typography>
              <Divider sx={{ m: 1 }} />

              <Typography sx={infoStyles.subtitle}>
                {t("visitCard.reason", "Reason")}: {reason}
              </Typography>
              <Divider sx={{ m: 1 }} />

              <Typography sx={infoStyles.subtitle}>
                {t("visitCard.date", "Date")}:{" "}
                {date ? date.format("DD/MM/YYYY HH:mm") : t("visitCard.na", "N/A")}
              </Typography>
              <Divider sx={{ m: 1 }} />

              <Typography sx={infoStyles.subtitle}>
                {t("visitCard.note", "Note")}: {notePublic || t("visitCard.na", "N/A")}
              </Typography>
              <Divider sx={{ m: 1 }} />

              {userRole !== "client" && notePrivate && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography sx={infoStyles.subtitle}>
                    {t("visitCard.privateNote", "Private Note")}: {notePrivate}
                  </Typography>
                </>
              )}

              <Typography sx={infoStyles.subtitle}>
                {t("visitCard.completed", "Completed")}:{" "}
                {completed ? t("visitCard.yes", "Yes") : t("visitCard.no", "No")}
              </Typography>
              <Divider sx={{ m: 1 }} />

              <Typography sx={infoStyles.subtitle}>
                {t("visitCard.issuedBy", "Issued by")}: {issuerName}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default React.memo(VisitCard);
