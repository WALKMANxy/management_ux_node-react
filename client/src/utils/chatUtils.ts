import dayjs from "dayjs";
import i18next from "i18next";
import { IChat, IMessage, Promo, Visit } from "../models/dataModels";

export type OverdueSummary = {
  type: "overdueSummary";
  count: number;
};

const sanitizeRegex = /[^\w\s]/gi;

export const sanitizeSearchTerm = (term: string) =>
  term.replace(sanitizeRegex, "").toLowerCase();

export const formatDateChats = (date: Date) => {
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

export const isDifferentDay = (date1?: Date, date2?: Date): boolean => {
  if (!date1 || !date2 || isNaN(date1.getTime()) || isNaN(date2.getTime())) {
    return false;
  }
  return !dayjs(date1).isSame(dayjs(date2), "day");
};

export const canUserChat = (chat: IChat, currentUserId: string): boolean => {
  // If the chat is still pending, the user cannot chat
  if (chat.status === "pending") return false;

  // Block replies if the bot (with the specific user ID) is a participant, double check this when the app is deployed and the bot account's ready.
  const botUserId = "6709d5038b196c75a7d5194f";
  const otherParticipants = chat.participants.filter(
    (id) => id !== currentUserId
  );

  if (chat.type === "simple" && otherParticipants.includes(botUserId)) {
    return false; // Prevent user from replying if it's a bot chat
  }

  // For broadcast chats, only admins can reply
  if (chat.type === "broadcast") {
    return (
      chat.admins?.some((adminId) => adminId.toString() === currentUserId) ||
      false
    );
  }

  // By default, allow chatting
  return true;
};

function isPromo(data: Promo | Visit): data is Promo {
  return (data as Promo).promoType !== undefined;
}

function isVisit(data: Promo | Visit): data is Visit {
  return (data as Visit).visitReason !== undefined;
}

export function generateAutomatedMessage(
  data: Promo | Visit,
  messageTypeOverride?: IMessage["messageType"],
  count?: number
): Partial<IMessage> {
  const timestamp = new Date();

  let content = "";
  let messageType: IMessage["messageType"];

  // Determine the message type
  if (messageTypeOverride) {
    messageType = messageTypeOverride;
  } else if (isPromo(data)) {
    messageType = "promo";
  } else if (isVisit(data)) {
    messageType = "visit";
  } else {
    throw new Error("Either a promo or visit object must be provided.");
  }

  // Generate content based on the message type
  if (messageType === "alert" && isVisit(data)) {
    // Overdue visit alert with optional count for overdue visits
    content = i18next.t("messages.overdueVisitMessage", {
      visitReason: data.visitReason,
      visitDate: data.date.toLocaleDateString(),
      count: count || 1,
    });
  } else if (messageType === "promo" && isPromo(data)) {
    content = i18next.t("messages.promoMessage", {
      promoType: data.promoType,
      promoName: data.name,
      promoDiscount: data.discount,
    });
  } else if (messageType === "visit" && isVisit(data)) {
    content = i18next.t("messages.visitMessage", {
      visitType: data.type,
      visitReason: data.visitReason,
      visitDate: data.date.toLocaleDateString(),
    });
  } else {
    throw new Error("Invalid message type or data provided.");
  }

  const message: Partial<IMessage> = {
    content,
    timestamp,
    status: "pending",
    messageType,
  };

  return message;
}

export const getFileExtension = (fileName: string) =>
  fileName.split(".").pop()?.toLowerCase(); // Extract file extension

export const formatFileSize = (size: number): string => {
  if (size === 0) return "0 Bytes";
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return `${(size / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};
