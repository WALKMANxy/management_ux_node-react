import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Collapse,
  IconButton,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Menu,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useSelector } from "react-redux";
import { useGetClientsQuery } from "../../services/api";
import { RootState } from "../../app/store";
import DetailComponent from "../../components/common/DetailComponent";
import HistoryComponent from "../../components/common/HistoryComponent";
import AGGridTable from "../../components/common/AGGridTable";
import { Client } from "../../models/models";
import {
  calculateMonthlyOrders,
  calculateMonthlyRevenue,
} from "../../utils/dataUtils";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import '../styles/AGGrid.css'

const ClientsPage: React.FC = () => {
  const { data: clients = [] } = useGetClientsQuery();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientListCollapsed, setClientListCollapsed] = useState(false);
  const [isClientDetailsCollapsed, setClientDetailsCollapsed] = useState(false);
  const userRole = useSelector((state: RootState) => state.auth.userRole);
  const userId = useSelector((state: RootState) => state.auth.id);
  const [quickFilterText, setQuickFilterText] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<any>(null);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleClientSelect = useCallback(
    (clientId: string) => {
      const client = clients.find((client) => client.id === clientId) || null;
      setSelectedClient(client);
      setClientDetailsCollapsed(false);

      if (detailsRef.current) {
        detailsRef.current.scrollIntoView({ behavior: "smooth" });
      }
    },
    [clients]
  );

  const filteredClients = useCallback(() => {
    let filtered = clients;
    if (userRole === "agent") {
      filtered = filtered.filter((client) => client.agent === userId);
    } else if (userRole === "client") {
      filtered = filtered.filter((client) => client.id === userId);
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = filtered.filter((client) => {
        return client.movements.some((movement) => {
          const movementDate = new Date(movement.dateOfOrder);
          return movementDate >= start && movementDate <= end;
        });
      });
    }
    return filtered;
  }, [clients, userRole, userId, startDate, endDate]);

  const onFilterTextBoxChanged = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setQuickFilterText(event.target.value);
    },
    []
  );

  const handleDateFilter = useCallback(() => {
    setStartDate(startDate);
    setEndDate(endDate);
  }, [startDate, endDate]);

  const exportDataAsCsv = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.api.exportDataAsCsv();
    }
  }, []);

  const columnDefs = useMemo(
    () => [
      { headerName: "Name", field: "name", filter: "agTextColumnFilter" },
      {
        headerName: "Province",
        field: "province",
        filter: "agTextColumnFilter",
      },
      { headerName: "Phone", field: "phone", filter: "agTextColumnFilter" },
      {
        headerName: "Total Orders",
        field: "totalOrders",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Orders This Month",
        valueGetter: (params: any) =>
          calculateMonthlyOrders(params.data.movements),
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Total Revenue",
        field: "totalRevenue",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Revenue This Month",
        valueGetter: (params: any) =>
          calculateMonthlyRevenue(params.data.movements),
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Unpaid Revenue",
        field: "unpaidRevenue",
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Payment Method",
        field: "paymentMethod",
        filter: "agTextColumnFilter",
      },
      {
        headerName: "Actions",
        field: "id",
        cellRenderer: (params: any) => {
          return (
            <button onClick={() => handleClientSelect(params.value)}>
              View
            </button>
          );
        },
      },
    ],
    [handleClientSelect]
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", p: 2 }}>
      <Paper elevation={3} sx={{ mb: 2 }}>
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
              <TextField
                id="filter-text-box"
                placeholder="Quick Filter..."
                variant="outlined"
                size="small"
                fullWidth
                onChange={onFilterTextBoxChanged}
              />
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
              {isMobile ? (
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <IconButton onClick={handleMenuOpen}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={handleDateFilter}>Filter</MenuItem>
                    <MenuItem onClick={exportDataAsCsv}>Export CSV</MenuItem>
                  </Menu>
                </Box>
              ) : (
                <>
                  <Button variant="contained" onClick={handleDateFilter}>
                    Filter
                  </Button>
                  <Button variant="contained" onClick={exportDataAsCsv}>
                    Export CSV
                  </Button>
                </>
              )}
            </Box>
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

      <Paper elevation={3} ref={detailsRef}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
          }}
        >
          <Typography variant="h6">Client Details</Typography>
          <IconButton
            onClick={() => setClientDetailsCollapsed(!isClientDetailsCollapsed)}
          >
            {isClientDetailsCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
        </Box>
        <Collapse in={!isClientDetailsCollapsed}>
          {selectedClient && (
            <Box sx={{ p: 2 }}>
              <Card variant="outlined">
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <DetailComponent detail={selectedClient} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6" gutterBottom>
                        Visits History
                      </Typography>
                      <HistoryComponent history={selectedClient.visits} />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}
        </Collapse>
      </Paper>
    </Box>
  );
};

export default ClientsPage;
