// src/pages/common/ClientsPage.tsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import GlobalSearch from "../../components/common/GlobalSearch";
import DetailComponent from "../../components/common/DetailComponent";
import HistoryComponent from "../../components/common/HistoryComponent";

const mockClientDetails = {
  name: "Client 1",
  address: "123 Main St",
  email: "client1@example.com",
  phone: "123-456-7890",
  ordersThisMonth: 5,
  revenueThisMonth: "$5000",
  unpaidRevenue: "$1000",
};

const mockVisitsHistory = [
  { date: "2023-01-01", note: "Initial consultation" },
  { date: "2023-02-15", note: "Follow-up visit" },
  { date: "2023-03-10", note: "Routine check" },
];

const mockClientsList = [
  {
    id: "1",
    name: "Client 1",
    province: "CT",
    phone: "123-456-7890",
    ordersThisMonth: 5,
    revenueThisMonth: "$5000",
    unpaidRevenue: "$1000",
  },
  {
    id: "2",
    name: "Client 2",
    province: "PA",
    phone: "123-456-7891",
    ordersThisMonth: 3,
    revenueThisMonth: "$3000",
    unpaidRevenue: "$500",
  },
  {
    id: "3",
    name: "Client 3",
    province: "NY",
    phone: "123-456-7892",
    ordersThisMonth: 4,
    revenueThisMonth: "$4000",
    unpaidRevenue: "$1500",
  },
  // Add more mock data to make the list scrollable
];

const ClientsPage: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [isClientListCollapsed, setClientListCollapsed] = useState(false);
  const [isClientDetailsCollapsed, setClientDetailsCollapsed] = useState(false);

  const handleClientSelect = (client: string) => {
    setSelectedClient(client);
    setClientDetailsCollapsed(false);
  };

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
            <GlobalSearch filter="client" onSelect={handleClientSelect} />
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Province</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Orders This Month</TableCell>
                    <TableCell>Revenue This Month</TableCell>
                    <TableCell>Unpaid Revenue</TableCell>
                    <TableCell>Visit History</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockClientsList.map((client) => (
                    <TableRow
                      key={client.id}
                      onClick={() => handleClientSelect(client.name)}
                      hover
                    >
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.province}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>{client.ordersThisMonth}</TableCell>
                      <TableCell>{client.revenueThisMonth}</TableCell>
                      <TableCell>{client.unpaidRevenue}</TableCell>
                      <TableCell>
                        <button onClick={() => handleClientSelect(client.name)}>
                          View
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Collapse>
      </Paper>

      <Paper elevation={3}>
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
                      <DetailComponent detail={mockClientDetails} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6" gutterBottom>
                        Visits History
                      </Typography>
                      <HistoryComponent history={mockVisitsHistory} />
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
