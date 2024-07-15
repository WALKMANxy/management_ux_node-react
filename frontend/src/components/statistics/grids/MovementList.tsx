// src/components/statistics/grids/MovementList.tsx
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
import { MovementListProps } from "../../../models/models";
import AGGridTable from "./AGGridTable";

const MovementList: React.FC<MovementListProps> = ({
  quickFilterText,
  setQuickFilterText,
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
        <Typography variant="h6">{t("movementList.title")}</Typography>
        <IconButton
          onClick={() => setMovementListCollapsed(!isMovementListCollapsed)}
        >
          {isMovementListCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </IconButton>
      </Box>
      <Collapse in={!isMovementListCollapsed}>
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
                placeholder={t("movementList.quickFilterPlaceholder")}
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
              label={t("movementList.startDate")}
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth={isMobile}
            />
            <TextField
              type="date"
              label={t("movementList.endDate")}
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
              {t("movementList.exportCSV")}
            </MenuItem>
          </Menu>
          <AGGridTable
            ref={gridRef}
            columnDefs={columnDefs}
            rowData={filteredMovements()}
            paginationPageSize={500}
            quickFilterText={quickFilterText}
          />
        </Box>
      </Collapse>
      <div ref={movementDetailsRef} />
    </Paper>
  );
};

export default MovementList;
