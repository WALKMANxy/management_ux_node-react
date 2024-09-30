// src/utils/iconUtils.tsx

import AirplaneTicketIcon from "@mui/icons-material/AirplaneTicket";
import BlindsClosedIcon from "@mui/icons-material/BlindsClosed";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import GroupsIcon from "@mui/icons-material/Groups";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MediationIcon from "@mui/icons-material/Mediation";
import ReportOffIcon from "@mui/icons-material/ReportOff";
import SickIcon from "@mui/icons-material/Sick";
import TourIcon from "@mui/icons-material/Tour";
import VideocamIcon from "@mui/icons-material/Videocam";
import WorkOffIcon from "@mui/icons-material/WorkOff";
import dayjs from "dayjs";
import React from "react";
import { CalendarEvent } from "../models/dataModels";

const iconMap: Record<string, React.ReactNode> = {
  illness: <SickIcon fontSize="small" style={{ marginRight: 4 }} />,
  day_off: <WorkOffIcon fontSize="small" style={{ marginRight: 4 }} />,
  unexpected_event: (
    <ReportOffIcon fontSize="small" style={{ marginRight: 4 }} />
  ),
  medical_visit: (
    <LocalHospitalIcon fontSize="small" style={{ marginRight: 4 }} />
  ),
  company_party: (
    <AirplaneTicketIcon fontSize="small" style={{ marginRight: 4 }} />
  ),
  conference: <VideocamIcon fontSize="small" style={{ marginRight: 4 }} />,
  company_holiday: (
    <BlindsClosedIcon fontSize="small" style={{ marginRight: 4 }} />
  ),
  company_meeting: <GroupsIcon fontSize="small" style={{ marginRight: 4 }} />,
  expo: <MediationIcon fontSize="small" style={{ marginRight: 4 }} />,
  issues: <TourIcon fontSize="small" style={{ marginRight: 4 }} />,
  routine: <TourIcon fontSize="small" style={{ marginRight: 4 }} />,
  new_client: <TourIcon fontSize="small" style={{ marginRight: 4 }} />,
  generic: <EventAvailableIcon fontSize="small" style={{ marginRight: 4 }} />,
};

const backgroundColorMap: Record<string, Record<string, string>> = {
  absence: {
    pending: "#BDBDBD",
    approved: "#FFA726",
    rejected: "#A8A8A8",
  },
  holiday: { default: "#E8F5E9" },
  event: { default: "#E3F2FD" },
};

export const getIconForReason = (reason: string): React.ReactNode => {
  return iconMap[reason] || null;
};

export const getBackgroundColorForEvent = (
  event: CalendarEvent,
  userRole: string
): string => {
  const typeColors = backgroundColorMap[event.eventType];
  if (typeColors) {
    if (
      event.eventType === "absence" &&
      event.status === "approved" &&
      userRole !== "admin"
    ) {
      // Return faint green for non-admin users
      return "#C7E7B6";
    }
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

export const getComparator = (
  order: "asc" | "desc",
  orderBy: keyof CalendarEvent | "actions"
) => {
  if (orderBy === "actions") {
    return (a: CalendarEvent, b: CalendarEvent) =>
      actionComparator(a, b, order);
  }
  return order === "desc"
    ? (a: CalendarEvent, b: CalendarEvent) =>
        descendingComparator(a, b, orderBy)
    : (a: CalendarEvent, b: CalendarEvent) =>
        -descendingComparator(a, b, orderBy);
};

export const descendingComparator = <T,>(a: T, b: T, orderBy: keyof T) => {
  if (orderBy === "startDate" || orderBy === "endDate") {
    return (
      new Date(b[orderBy] as string).getTime() -
      new Date(a[orderBy] as string).getTime()
    );
  }
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
};

// Custom comparator for sorting by pending actions first and then by date
export const actionComparator = (
  a: CalendarEvent,
  b: CalendarEvent,
  order: "asc" | "desc"
) => {
  const aIsPending = a.status === "pending";
  const bIsPending = b.status === "pending";

  // Prioritize pending events
  if (aIsPending && !bIsPending) return -1;
  if (!aIsPending && bIsPending) return 1;

  // If both are pending or both are not pending, sort by startDate
  return order === "desc"
    ? new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    : new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
};

// Helper function to check if the time is different from the default 12:00 AM
export const isNotDefaultTime = (date: Date | undefined) => {
  return date && dayjs(date).format("HH:mm") !== "00:00";
};
