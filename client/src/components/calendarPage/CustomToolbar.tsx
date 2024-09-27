import CalendarViewMonthIcon from "@mui/icons-material/CalendarViewMonth";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ViewDayIcon from "@mui/icons-material/ViewDay";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import {
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DateRangeIcon } from "@mui/x-date-pickers";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface CustomToolbarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toolbar: any;
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
}

export const CustomToolbar: React.FC<CustomToolbarProps> = ({
  toolbar,
  setCurrentDate,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const goToBack = () => {
    toolbar.onNavigate("PREV");
    setCurrentDate((prev) => {
      const prevMonth = prev.getMonth() - 1;
      const newYear =
        prevMonth < 0 ? prev.getFullYear() - 1 : prev.getFullYear();
      const newMonth = prevMonth < 0 ? 11 : prevMonth;
      return new Date(newYear, newMonth, 1);
    });
  };

  const goToNext = () => {
    toolbar.onNavigate("NEXT");
    setCurrentDate((prev) => {
      const nextMonth = prev.getMonth() + 1;
      const newYear =
        nextMonth > 11 ? prev.getFullYear() + 1 : prev.getFullYear();
      const newMonth = nextMonth > 11 ? 0 : nextMonth;
      return new Date(newYear, newMonth, 1);
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

  const handleViewChange = (view: string) => {
    toolbar.onView(view);
    setAnchorEl(null);
  };

  return (
    <div
      className="rbc-toolbar"
      style={{
        display: "flex",
        alignItems: "center",
        paddingBottom: "5px",
        flexDirection: "row",
      }}
    >
      {isMobile ? (
        <>
          <IconButton
            onClick={goToToday}
            aria-label="today"
            style={{ borderRadius: "20px", border: "none" }}
          >
            <RestartAltIcon fontSize="medium" />
          </IconButton>
          <div style={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <IconButton
              onClick={goToBack}
              aria-label="previous"
              style={{ borderRadius: "20px", border: "none" }}
            >
              <ChevronLeftIcon fontSize="medium" />
            </IconButton>
            <span
              className="rbc-toolbar-label"
              style={{
                fontSize: "1rem",
                fontWeight: "bold",
                flex: 1,
                textAlign: "center",
                backgroundColor: "rgba(255, 255, 255, 0.8)", // subtle background
                borderRadius: "10px", // rounded corners
                padding: "5px 10px", // padding around the text
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)", // soft shadow
              }}
            >
              {toolbar.label}
            </span>

            <IconButton
              onClick={goToNext}
              aria-label="next"
              style={{ borderRadius: "20px", border: "none" }}
            >
              <ChevronRightIcon fontSize="medium" />
            </IconButton>
          </div>
          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            aria-label="view selector"
            style={{ borderRadius: "20px", border: "none" }}
          >
            <DateRangeIcon fontSize="medium" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => handleViewChange("month")}>
              {t("customToolbar.view.month")}
            </MenuItem>
            <MenuItem onClick={() => handleViewChange("week")}>
              {t("customToolbar.view.week")}
            </MenuItem>
            <MenuItem onClick={() => handleViewChange("day")}>
              {t("customToolbar.view.day")}
            </MenuItem>
          </Menu>
        </>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
          }}
        >
          {/* Refresh Icon anchored to flex start */}
          <Tooltip title={t("customToolbar.today")}>
            <IconButton
              onClick={goToToday}
              aria-label="today"
              style={{
                marginRight: "8px",
                borderRadius: "20px",
                border: "none",
              }}
            >
              <RestartAltIcon fontSize="large" />
            </IconButton>
          </Tooltip>

          {/* Navigation Buttons and Title anchored at center */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexGrow: 1,
              justifyContent: "center",
            }}
          >
            <Tooltip title={t("customToolbar.previous")}>
              <IconButton
                onClick={goToBack}
                aria-label="previous"
                style={{ borderRadius: "20px", border: "none" }}
              >
                <ChevronLeftIcon fontSize="large" />
              </IconButton>
            </Tooltip>
            <span
              className="rbc-toolbar-label"
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                textAlign: "center",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderRadius: "10px",
                padding: "5px 10px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                margin: "0 8px",
              }}
            >
              {toolbar.label}
            </span>
            <Tooltip title={t("customToolbar.next")}>
              <IconButton
                onClick={goToNext}
                aria-label="next"
                style={{ borderRadius: "20px", border: "none" }}
              >
                <ChevronRightIcon fontSize="large" />
              </IconButton>
            </Tooltip>
          </div>

          {/* View Buttons anchored at flex-end */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: "auto",
            }}
          >
            <Tooltip title={t("customToolbar.view.month")}>
              <IconButton
                onClick={goToMonthView}
                aria-label="month view"
                style={{ borderRadius: "20px", border: "none" }}
              >
                <CalendarViewMonthIcon fontSize="large" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("customToolbar.view.week")}>
              <IconButton
                onClick={goToWeekView}
                aria-label="week view"
                style={{ borderRadius: "20px", border: "none" }}
              >
                <ViewWeekIcon fontSize="large" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("customToolbar.view.day")}>
              <IconButton
                onClick={goToDayView}
                aria-label="day view"
                style={{ borderRadius: "20px", border: "none" }}
              >
                <ViewDayIcon fontSize="large" />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
};
