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
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ClientListProps } from "../../../models/propsModels";
import AGGridTable from "./AGGridTable";

const ClientList: React.FC<ClientListProps> = ({
  quickFilterText,
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

  // Memoized handler for collapsing/expanding the clients list
  const handleCollapseToggle = useCallback(() => {
    setClientListCollapsed(!isClientListCollapsed);
  }, [isClientListCollapsed, setClientListCollapsed]);

  // Memoized handler for exporting data as CSV
  const handleExportCSV = useCallback(() => {
    exportDataAsCsv();
    handleMenuClose();
  }, [exportDataAsCsv, handleMenuClose]);

  // Memoize column definitions
  const memoizedColumnDefs = useMemo(() => columnDefs, [columnDefs]);

  return (
    <Paper
      elevation={8}
      sx={{ mb: 2, borderRadius: 2, height: isMobile ? 500 * 1.33 : "100%" }}
    >
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
          {t("clientList.title")}
        </Typography>
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
      <Collapse
        in={!isClientListCollapsed}
        sx={{ pt: isMobile ? 2 : 0, pb: 4 }}
      >
        <Box sx={{ p: 2, pt: 0 }}>
          {/* Filter and Menu Section */}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              flexDirection: "row-reverse  ",
              gap: 2,
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 1,
                flex: 1,
              }}
            >
              <Tooltip title={t("clientList.options")}>
                <IconButton
                  onClick={handleMenuOpen}
                  aria-label={t("clientList.options")}
                >
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
            </Box>
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
            rowData={filteredClients}
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
