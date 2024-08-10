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
  Typography,
} from "@mui/material";
import React from "react";
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

  const onFilterTextBoxChanged = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setQuickFilterText(event.target.value);
  };

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
        <IconButton
          onClick={() => setClientListCollapsed(!isClientListCollapsed)}
        >
          {isClientListCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </IconButton>
      </Box>
      <Collapse in={!isClientListCollapsed}>
        <Box sx={{ p: 2 }}>
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
                onChange={onFilterTextBoxChanged}
              />
              <IconButton onClick={handleMenuOpen}>
                <MoreVertIcon />
              </IconButton>
            </Box>
            <TextField
              type="date"
              label={t("clientList.startDate")}
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth={isMobile}
            />
            <TextField
              type="date"
              label={t("clientList.endDate")}
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth={isMobile}
            />
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={exportDataAsCsv}>
              {t("clientList.exportCSV")}
            </MenuItem>
          </Menu>
          <AGGridTable
            ref={gridRef}
            columnDefs={columnDefs}
            rowData={filteredClients()}
            paginationPageSize={500}
            quickFilterText={quickFilterText}
          />
        </Box>
      </Collapse>
      <div ref={clientDetailsRef} />
    </Paper>
  );
};

export default ClientList;
