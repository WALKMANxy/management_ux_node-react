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
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MovementListProps } from "../../../models/propsModels";
import AGGridTable from "./AGGridTable";

const FilterBox: React.FC<{
  onFilterChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLButtonElement>) => void;
  t: (key: string) => string;
}> = React.memo(({ onFilterChange, onMenuOpen, t }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
    <TextField
      id="filter-text-box"
      placeholder={t("movementList.quickFilterPlaceholder")}
      variant="outlined"
      size="small"
      fullWidth
      onChange={onFilterChange}
      inputProps={{ "aria-label": t("movementList.quickFilterAriaLabel") }}
    />
    <IconButton
      onClick={onMenuOpen}
      aria-label={t("movementList.moreOptionsAriaLabel")}
    >
      <MoreVertIcon />
    </IconButton>
  </Box>
));

const DateInputs: React.FC<{
  startDate: string;
  endDate: string;
  onStartDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEndDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isMobile: boolean;
  t: (key: string) => string;
}> = React.memo(
  ({ startDate, endDate, onStartDateChange, onEndDateChange, isMobile, t }) => (
    <>
      <TextField
        type="date"
        label={t("movementList.startDate")}
        InputLabelProps={{ shrink: true }}
        value={startDate}
        onChange={onStartDateChange}
        fullWidth={isMobile}
      />
      <TextField
        type="date"
        label={t("movementList.endDate")}
        InputLabelProps={{ shrink: true }}
        value={endDate}
        onChange={onEndDateChange}
        fullWidth={isMobile}
      />
    </>
  )
);

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

  const onFilterTextBoxChanged = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setQuickFilterText(event.target.value);
    },
    [setQuickFilterText]
  );

  const toggleCollapse = useCallback(() => {
    setMovementListCollapsed(!isMovementListCollapsed);
  }, [isMovementListCollapsed, setMovementListCollapsed]);

  const memoizedFilteredMovements = useMemo(
    () => filteredMovements(),
    [filteredMovements]
  );

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
          onClick={toggleCollapse}
          aria-label={t(
            isMovementListCollapsed
              ? "movementList.expandAriaLabel"
              : "movementList.collapseAriaLabel"
          )}
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
            <FilterBox
              onFilterChange={onFilterTextBoxChanged}
              onMenuOpen={handleMenuOpen}
              t={t}
            />
            <DateInputs
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={(e) => setStartDate(e.target.value)}
              onEndDateChange={(e) => setEndDate(e.target.value)}
              isMobile={isMobile}
              t={t}
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
            rowData={memoizedFilteredMovements}
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
