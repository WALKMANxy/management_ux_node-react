// components/calendarPage/CalendarEventComponent.tsx

import React from "react";
import { CalendarEvent } from "../../models/dataModels";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../app/hooks";
import { selectUserById } from "../../features/users/userSlice";

// Import the necessary icons
import SickIcon from "@mui/icons-material/Sick";
import WorkOffIcon from "@mui/icons-material/WorkOff";
import ReportOffIcon from "@mui/icons-material/ReportOff";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AirplaneTicketIcon from "@mui/icons-material/AirplaneTicket";
import VideocamIcon from "@mui/icons-material/Videocam";
import BlindsClosedIcon from "@mui/icons-material/BlindsClosed";
import MediationIcon from "@mui/icons-material/Mediation";

interface CalendarEventComponentProps {
  event: CalendarEvent;
}

const CalendarEventComponent: React.FC<CalendarEventComponentProps> = ({ event }) => {




  const { t } = useTranslation();
  const user = useAppSelector((state) => selectUserById(state, event.userId));
  const entityName = user?.entityName || t("Unknown");

  // Function to map reason to icon
  const getIconForReason = (reason: string): React.ReactNode => {
    switch (reason) {
      case "illness":
        return <SickIcon fontSize="small" style={{ marginRight: 4 }} />;
      case "day_off":
        return <WorkOffIcon fontSize="small" style={{ marginRight: 4 }} />;
      case "unexpected_event":
        return <ReportOffIcon fontSize="small" style={{ marginRight: 4 }} />;
      case "medical_visit":
        return <LocalHospitalIcon fontSize="small" style={{ marginRight: 4 }} />;
      case "company_party":
        return <AirplaneTicketIcon fontSize="small" style={{ marginRight: 4 }} />;
      case "conference":
        return <VideocamIcon fontSize="small" style={{ marginRight: 4 }} />;
      case "company_holiday":
        return <BlindsClosedIcon fontSize="small" style={{ marginRight: 4 }} />;
      case "expo":
        return <MediationIcon fontSize="small" style={{ marginRight: 4 }} />;
      // Add more cases as needed
      default:
        return null;
    }
  };

  // Determine the title based on event type and reason
  let title: React.ReactNode;

  if (event.eventType === "event") {
    // Use i18n to translate the reason and include the icon for specific reasons
    title = (
      <span>
        {getIconForReason(event.reason)} {t(`reasons.${event.reason}`)}
      </span>
    );
  } else if (event.eventType === "absence") {
    // Include icon and entity name
    title = (
      <span>
        {getIconForReason(event.reason)} {entityName}
      </span>
    );
  } else {
    // Fallback to eventName
    title = event.eventName;
  }

  return <span>{title}</span>;
};

export default CalendarEventComponent;
