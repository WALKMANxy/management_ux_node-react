//Src/components/common/ClientList.tsx
import React from "react";
import {
  Paper,
  Box,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Collapse,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AGGridTable from "./AGGridTable";
import { ClientListProps } from "../../../models/models";

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
}) => {
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
        <Typography variant="h6">Clients</Typography>
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
                placeholder="Quick Filter..."
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
              label="Start Date"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth={isMobile}
            />
            <TextField
              type="date"
              label="End Date"
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
            <MenuItem onClick={exportDataAsCsv}>Export CSV</MenuItem>
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
    </Paper>
  );
};

export default ClientList;
