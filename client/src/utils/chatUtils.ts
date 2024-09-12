import dayjs from "dayjs";

  // Utility to sanitize the search term
  export const sanitizeSearchTerm = (term: string) =>
    term.replace(/[^\w\s]/gi, "").toLowerCase();

   // Format date for the chat preview
  export  const formatDate = (date: Date) => {
    const dayDifference = dayjs().diff(dayjs(date), "day");
    if (dayDifference === 0) {
      return dayjs(date).format("hh:mm A");
    } else if (dayDifference === 1) {
      return "Yesterday";
    } else {
      return dayjs(date).format("MMM D");
    }
  };