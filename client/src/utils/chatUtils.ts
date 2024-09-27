import dayjs from "dayjs";
import { IChat } from "../models/dataModels";

// Utility to sanitize the search term
export const sanitizeSearchTerm = (term: string) =>
  term.replace(/[^\w\s]/gi, "").toLowerCase();

// Format date for the chat preview
export const formatDate = (date: Date) => {
  const dayDifference = dayjs().diff(dayjs(date), "day");
  if (dayDifference === 0) {
    return dayjs(date).format("hh:mm A");
  } else if (dayDifference === 1) {
    return "Yesterday";
  } else {
    return dayjs(date).format("MMM D");
  }
};

export const formatDateForDivider = (date: Date) => {
  const dayDifference = dayjs().diff(dayjs(date), "day");
  if (dayDifference === 0) {
    return "Today";
  } else if (dayDifference === 1) {
    return "Yesterday";
  } else if (dayDifference > 1) {
    return dayjs(date).format("dddd");
  } else {
    return dayjs(date).format("MMM D");
  }
};

// chatUtils.ts

export const isDifferentDay = (date1?: Date, date2?: Date): boolean => {
  if (!date1 || !date2) {
    return false;
  }
  if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
    return false;
  }

  try {
    return (
      dayjs(date1).isBefore(dayjs(date2), "day") ||
      dayjs(date2).isBefore(dayjs(date1), "day")
    );
  } catch {
    return false;
  }
};

/**
 * Determines if a user can send messages in a chat.
 *
 * @param chat - The chat object.
 * @param currentUserId - The ID of the current user.
 * @returns A boolean indicating if the user can chat.
 */
export const canUserChat = (chat: IChat, currentUserId: string): boolean => {
  // If the chat is pending, disable the input
  if (chat.status === "pending") {
    return false;
  }

  // If the chat type is broadcast, check if the user is an admin
  if (chat.type === "broadcast") {
    // Ensure admins array exists
    if (chat.admins && chat.admins.length > 0) {
      // Check if currentUserId is in the admins array
      const isAdmin = chat.admins.some(
        (adminId) => adminId.toString() === currentUserId
      );
      if (!isAdmin) {
        return false;
      }
    } else {
      // If no admins are defined, treat it as non-admin
      return false;
    }
  }

  // In all other cases, allow chatting
  return true;
};
