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

const iconMap: Record<string, React.ReactNode> = {
  illness: <SickIcon fontSize="small" style={{ marginRight: 4 }} />,
  day_off: <WorkOffIcon fontSize="small" style={{ marginRight: 4 }} />,
  unexpected_event: <ReportOffIcon fontSize="small" style={{ marginRight: 4 }} />,
  medical_visit: <LocalHospitalIcon fontSize="small" style={{ marginRight: 4 }} />,
  company_party: <AirplaneTicketIcon fontSize="small" style={{ marginRight: 4 }} />,
  conference: <VideocamIcon fontSize="small" style={{ marginRight: 4 }} />,
  company_holiday: <BlindsClosedIcon fontSize="small" style={{ marginRight: 4 }} />,
  expo: <MediationIcon fontSize="small" style={{ marginRight: 4 }} />,
};

const backgroundColorMap: Record<string, Record<string, string>> = {
  absence: {
    pending: "#BDBDBD",
    approved: "#FFA726",
    other: "#FFEBEE",
  },
  holiday: { default: "#E8F5E9" },
  event: { default: "#E3F2FD" },
};


export const getIconForReason = (reason: string): React.ReactNode => {
  return iconMap[reason] || null;
};

export const getBackgroundColorForEvent = (event: CalendarEvent): string => {
  const typeColors = backgroundColorMap[event.eventType];
  if (typeColors) {
    return typeColors[event.status] || typeColors.default || "";
  }
  return "";
};

// Utility function to convert strings to Date objects
export const normalizeDate = (date: string | Date): Date => {
  // Only convert if the date is a string
  return typeof date === "string" ? new Date(date) : date;
};

export const transformCalendarEvents = (
  events: CalendarEvent[]
): CalendarEvent[] => {
  return events.map((event) => ({
    ...event,
    createdAt: normalizeDate(event.createdAt),
    startDate: normalizeDate(event.startDate),
    endDate: normalizeDate(event.endDate),
    updatedAt: normalizeDate(event.updatedAt),
  }));
};
