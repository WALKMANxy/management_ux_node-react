// src/components/statistics/grids/MovementList.tsx
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import {
  Box,
  Collapse,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MovementListProps } from "../../../models/propsModels";
import { locale } from "../../../services/localizer";
import AGGridTable from "./AGGridTable";

const MovementList: React.FC<MovementListProps> = ({
  quickFilterText,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  filteredMovements,
  columnDefs,
  gridRef,
  handleMenuOpen,
  handleMenuClose,
  anchorEl,
  exportDataAsCsv,
  isMovementListCollapsed,
  setMovementListCollapsed,
  isMobile,
  movementDetailsRef,
}) => {
  const { t } = useTranslation();

  // Memoized handler for collapsing/expanding the movements list
  const handleCollapseToggle = useCallback(() => {
    setMovementListCollapsed(!isMovementListCollapsed);
  }, [isMovementListCollapsed, setMovementListCollapsed]);

  // Memoized handler for exporting data as CSV
  const handleExportCSV = useCallback(() => {
    exportDataAsCsv();
    handleMenuClose();
  }, [exportDataAsCsv, handleMenuClose]);

  // Memoize filtered movements to prevent unnecessary re-renders
  const memoizedFilteredMovements = useMemo(
    () => filteredMovements,
    [filteredMovements]
  );

  // Memoize column definitions
  const memoizedColumnDefs = useMemo(() => columnDefs, [columnDefs]);

  return (
    <Paper
      elevation={8}
      sx={{ mb: 2, borderRadius: 2, height: isMobile ? 500 * 1.33 : "100%" }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{ pl: 2, pt: isMobile ? 0 : 2, mb: isMobile ? -2 : -6 }}
        >
          {t("movementList.title")}
        </Typography>
        <Tooltip
          title={
            isMovementListCollapsed
              ? t("movementList.expand")
              : t("movementList.collapse")
          }
        >
          <IconButton
            onClick={handleCollapseToggle}
            aria-label={
              isMovementListCollapsed
                ? t("movementList.expand")
                : t("movementList.collapse")
            }
          >
            {isMovementListCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Collapsible Content */}
      <Collapse
        in={!isMovementListCollapsed}
        sx={{ pt: isMobile ? 2 : 0, pb: 4 }}
      >
        <Box sx={{ p: 2, pt: 0 }}>
          {/* Filter and Menu Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row-reverse",
              gap: 2,
              mb: 2,
            }}
          >
            {/* Quick Filter and Options Menu */}

            <Tooltip title={t("movementList.options")}>
              <IconButton
                onClick={handleMenuOpen}
                aria-label={t("movementList.options")}
              >
                <MoreVertIcon />
              </IconButton>
            </Tooltip>

            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale={locale}
            >
              {/* End Date Filter */}
              <DatePicker
                label={t("movementList.endDate")}
                value={endDate ? dayjs(endDate) : null}
                onChange={(newDate: Dayjs | null) =>
                  setEndDate(newDate?.toISOString() ?? "")
                }
                slotProps={{
                  actionBar: { hidden: true }, // This hides the toolbar
                  textField: {
                    sx: {
                      "& .MuiInputBase-root": {
                        maxHeight: "50px", // Adjust to match TextField height
                        fontSize: "0.875rem", // Adjust font size if needed
                        maxWidth: "150px",
                      },
                    },
                  },
                }}
              />
              {/* Start Date Filter */}
              <DatePicker
                label={t("movementList.startDate")}
                value={startDate ? dayjs(startDate) : null}
                onChange={(newDate: Dayjs | null) =>
                  setStartDate(newDate?.toISOString() ?? "")
                }
                slotProps={{
                  actionBar: { hidden: true }, // This hides the toolbar
                  textField: {
                    sx: {
                      "& .MuiInputBase-root": {
                        maxHeight: "50px", // Adjust to match TextField height
                        fontSize: "0.875rem", // Adjust font size if needed
                        maxWidth: "150px",
                      },
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </Box>

          {/* Options Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem onClick={handleExportCSV}>
              {t("movementList.exportCSV")}
            </MenuItem>
          </Menu>

          {/* AG Grid Table */}
          <AGGridTable
            ref={gridRef}
            columnDefs={memoizedColumnDefs}
            rowData={memoizedFilteredMovements}
            paginationPageSize={100} // Adjusted to a more manageable number
            quickFilterText={quickFilterText}
          />
        </Box>
      </Collapse>

      {/* Reference for Movement Details (if needed for scrolling) */}
      <div ref={movementDetailsRef} />
    </Paper>
  );
};

export default React.memo(MovementList);
