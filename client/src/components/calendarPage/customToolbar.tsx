import CalendarViewMonthIcon from "@mui/icons-material/CalendarViewMonth";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ViewDayIcon from "@mui/icons-material/ViewDay";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import { IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import { useGetEventsByMonthForAdminQuery } from "../../features/calendar/calendarQuery";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CustomToolbar = (toolbar: any) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { refetch } = useGetEventsByMonthForAdminQuery({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
  });

  useEffect(() => {
    refetch();
  }, [currentDate, refetch]);

  const goToBack = () => {
    toolbar.onNavigate("PREV");
    setCurrentDate((prev) => {
      const prevMonth = prev.getMonth() - 1;
      return new Date(prev.getFullYear(), prevMonth < 0 ? 11 : prevMonth, 1);
    });
  };

  const goToNext = () => {
    toolbar.onNavigate("NEXT");
    setCurrentDate((prev) => {
      const nextMonth = prev.getMonth() + 1;
      return new Date(prev.getFullYear(), nextMonth > 11 ? 0 : nextMonth, 1);
    });
  };

  const goToToday = () => {
    toolbar.onNavigate("TODAY");
    setCurrentDate(new Date());
  };

  const goToMonthView = () => {
    toolbar.onView("month");
  };

  const goToWeekView = () => {
    toolbar.onView("week");
  };

  const goToDayView = () => {
    toolbar.onView("day");
  };

  return (
    <div
      className="rbc-toolbar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: "5px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <IconButton
          onClick={goToToday}
          aria-label="today"
          style={{
            marginRight: "8px",
            borderRadius: "20px",
          }}
        >
          Today
        </IconButton>
        <IconButton
          onClick={goToBack}
          aria-label="previous"
          style={{
            marginRight: "5px",
            marginLeft: "5px",
            borderRadius: "20px",
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <IconButton
          onClick={goToNext}
          aria-label="next"
          style={{
            marginRight: "8px",
            marginLeft: "8px",
            borderRadius: "20px",
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </div>
      <span
        className="rbc-toolbar-label"
        style={{ fontSize: "1.5rem", fontWeight: "bold" }}
      >
        {toolbar.label}
      </span>
      <div style={{ display: "flex", alignItems: "center" }}>
        <IconButton
          onClick={goToMonthView}
          aria-label="month view"
          style={{
            marginLeft: "8px",
            marginRight: "8px",
            borderRadius: "20px",
          }}
        >
          <CalendarViewMonthIcon />
        </IconButton>
        <IconButton
          onClick={goToWeekView}
          aria-label="week view"
          style={{
            marginLeft: "8px",
            marginRight: "8px",
            borderRadius: "20px",
          }}
        >
          <ViewWeekIcon />
        </IconButton>
        <IconButton
          onClick={goToDayView}
          aria-label="day view"
          style={{ marginLeft: "8px", borderRadius: "20px" }}
        >
          <ViewDayIcon />
        </IconButton>
      </div>
    </div>
  );
};
