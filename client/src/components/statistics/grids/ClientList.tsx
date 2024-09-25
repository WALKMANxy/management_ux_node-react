//src/components/statistics/grids/ClientList.tsx
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Collapse,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ClientListProps } from "../../../models/propsModels";
import AGGridTable from "./AGGridTable";

const ClientList: React.FC<ClientListProps> = ({
  quickFilterText,
  setQuickFilterText,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  filteredClients,
  columnDefs,
  gridRef,
  handleMenuOpen,
  handleMenuClose,
  anchorEl,
  exportDataAsCsv,
  isClientListCollapsed,
  setClientListCollapsed,
  isMobile,
  clientDetailsRef, // Add the clientDetailsRef prop
}) => {
  const { t } = useTranslation();

  // Memoized handler for filter text change
  const onFilterTextBoxChanged = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setQuickFilterText(event.target.value);
    },
    [setQuickFilterText]
  );

  // Memoized handler for collapsing/expanding the clients list
  const handleCollapseToggle = useCallback(() => {
    setClientListCollapsed(!isClientListCollapsed);
  }, [isClientListCollapsed, setClientListCollapsed]);

  // Memoized handler for exporting data as CSV
  const handleExportCSV = useCallback(() => {
    exportDataAsCsv();
    handleMenuClose();
  }, [exportDataAsCsv, handleMenuClose]);

  // Memoize the filteredClients value to prevent re-renders
  const memoizedFilteredClients = useMemo(
    () => filteredClients,
    [filteredClients]
  );

  // Memoize column definitions
  const memoizedColumnDefs = useMemo(() => columnDefs, [columnDefs]);

  return (
    <Paper elevation={8} sx={{ mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography variant="h6">{t("clientList.title")}</Typography>
        <Tooltip
          title={
            isClientListCollapsed
              ? t("clientList.expand")
              : t("clientList.collapse")
          }
        >
          <IconButton
            onClick={handleCollapseToggle}
            aria-label={
              isClientListCollapsed
                ? t("clientList.expand")
                : t("clientList.collapse")
            }
          >
            {isClientListCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      {/* Collapsible Content */}
      <Collapse in={!isClientListCollapsed}>
        <Box sx={{ p: 2 }}>
          {/* Filter and Menu Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 2,
              mb: 2,
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}
            >
              <TextField
                id="filter-text-box"
                placeholder={t("clientList.quickFilterPlaceholder")}
                variant="outlined"
                size="small"
                fullWidth
                value={quickFilterText}
                onChange={onFilterTextBoxChanged}
                InputProps={{
                  "aria-label": t("clientList.quickFilterAriaLabel"),
                }}
              />
              <Tooltip title={t("clientList.options")}>
                <IconButton
                  onClick={handleMenuOpen}
                  aria-label={t("clientList.options")}
                >
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <TextField
              type="date"
              label={t("clientList.startDate")}
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth={isMobile}
              InputProps={{
                "aria-label": t("clientList.startDateAriaLabel"),
              }}
            />
            <TextField
              type="date"
              label={t("clientList.endDate")}
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth={isMobile}
              InputProps={{
                "aria-label": t("clientList.endDateAriaLabel"),
              }}
            />
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
              {t("clientList.exportCSV")}
            </MenuItem>
          </Menu>

          {/* AG Grid Table */}
          <AGGridTable
            ref={gridRef}
            columnDefs={memoizedColumnDefs}
            rowData={memoizedFilteredClients}
            paginationPageSize={100} // Adjusted to a more manageable number
            quickFilterText={quickFilterText}
          />
        </Box>
      </Collapse>

      {/* Reference for Client Details (if needed for scrolling) */}
      <div ref={clientDetailsRef} />
    </Paper>
  );
};

export default React.memo(ClientList);
