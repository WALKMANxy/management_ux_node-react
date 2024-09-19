import dayjs from "dayjs";

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
