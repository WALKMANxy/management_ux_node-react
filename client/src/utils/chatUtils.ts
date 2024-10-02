import dayjs from "dayjs";
import i18next from "i18next";
import { IChat, IMessage, Promo, Visit } from "../models/dataModels";

// Utility to sanitize the search term
const sanitizeRegex = /[^\w\s]/gi;

export const sanitizeSearchTerm = (term: string) =>
  term.replace(sanitizeRegex, "").toLowerCase();

// Format date for the chat preview
export const formatDate = (date: Date) => {
  const dayjsDate = dayjs(date);
  const dayDifference = dayjs().diff(dayjsDate, "day");
  if (dayDifference === 0) {
    return dayjsDate.format("hh:mm A");
  } else if (dayDifference === 1) {
    return "Yesterday";
  } else {
    return dayjsDate.format("MMM D");
  }
};

export const formatDateForDivider = (date: Date) => {
  const dayjsDate = dayjs(date);
  const dayDifference = dayjs().diff(dayjsDate, "day");
  if (dayDifference === 0) {
    return "Today";
  } else if (dayDifference === 1) {
    return "Yesterday";
  } else if (dayDifference > 1) {
    return dayjsDate.format("dddd");
  } else {
    return dayjsDate.format("MMM D");
  }
};

// chatUtils.ts

export const isDifferentDay = (date1?: Date, date2?: Date): boolean => {
  if (!date1 || !date2 || isNaN(date1.getTime()) || isNaN(date2.getTime())) {
    return false;
  }
  return !dayjs(date1).isSame(dayjs(date2), "day");
};

/**
 * Determines if a user can send messages in a chat.
 *
 * @param chat - The chat object.
 * @param currentUserId - The ID of the current user.
 * @returns A boolean indicating if the user can chat.
 */
export const canUserChat = (chat: IChat, currentUserId: string): boolean => {
  if (chat.status === "pending") return false;

  if (chat.type === "broadcast") {
    return chat.admins?.some(adminId => adminId.toString() === currentUserId) || false;
  }

  return true;
};


// Type guard for Promo
function isPromo(data: Promo | Visit): data is Promo {
  return (data as Promo).promoType !== undefined;
}

// Type guard for Visit
function isVisit(data: Promo | Visit): data is Visit {
  return (data as Visit).visitReason !== undefined;
}

export function generateAutomatedMessage(
  data: Promo | Visit
): Partial<IMessage> {
  const timestamp = new Date();

  let content = "";
  let messageType: IMessage["messageType"];

  // Type guards to check the type of data
  if (isPromo(data)) {
    messageType = "promo";
    content = i18next.t("messages.promoMessage", {
      promoType: data.promoType,
      promoName: data.name,
      promoDiscount: data.discount,
    });
  } else if (isVisit(data)) {
    messageType = "visit";
    content = i18next.t("messages.visitMessage", {
      visitType: data.type,
      visitReason: data.visitReason,
      visitDate: data.date.toLocaleDateString(),
    });
  } else {
    throw new Error("Either a promo or visit object must be provided.");
  }

  const message: Partial<IMessage> = {
    content,
    timestamp,
    status: "pending",
    messageType,
  };

  return message;
}
