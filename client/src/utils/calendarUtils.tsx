// src/utils/iconUtils.tsx

import AirplaneTicketIcon from "@mui/icons-material/AirplaneTicket";
import BlindsClosedIcon from "@mui/icons-material/BlindsClosed";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MediationIcon from "@mui/icons-material/Mediation";
import ReportOffIcon from "@mui/icons-material/ReportOff";
import SickIcon from "@mui/icons-material/Sick";
import VideocamIcon from "@mui/icons-material/Videocam";
import WorkOffIcon from "@mui/icons-material/WorkOff";
import React from "react";
import { CalendarEvent } from "../models/dataModels";

export const getIconForReason = (reason: string): React.ReactNode => {
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
    default:
      return null;
  }
};

export const getBackgroundColorForEvent = (event: CalendarEvent): string => {
  if (event.eventType === "absence") {
    if (event.status === "pending") {
      return "#BDBDBD"; // Gray background for pending absences
    } else if (event.status === "approved") {
      return "#FFA726"; // Orange background for approved absences
    } else {
      return "#FFEBEE"; // Light red for other absences
    }
  } else if (event.eventType === "holiday") {
    return "#E8F5E9"; // Light green for holidays
  } else if (event.eventType === "event") {
    return "#E3F2FD"; // Light blue for events
  }
  return ""; // Default background color if none match
};

