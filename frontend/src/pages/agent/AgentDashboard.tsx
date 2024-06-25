// src/pages/agent/AgentDashboard.tsx
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import GlobalSearch from "../../components/common/GlobalSearch";
import useAgentStats from "../../features/hooks/useAgentStats";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Fab,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import CloseIcon from "@mui/icons-material/Close";

const AgentDashboard: React.FC = () => {
  const loggedInAgentId = useSelector((state: RootState) => state.auth.id);
  const {
    agentDetails,
    selectedClient,
    selectClient,
    calculateTotalSpentThisMonth,
    calculateTotalSpentThisYear,
    calculateTopArticleType,
  } = useAgentStats(loggedInAgentId);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClientSelect = (clientName: string) => {
    selectClient(clientName);
  };

  if (!agentDetails) {
    return <CircularProgress />;
  }

  const totalRevenue = agentDetails.clients
    .reduce((total, client) => total + parseFloat(client.totalRevenue), 0)
    .toFixed(2);

  const totalOrders = agentDetails.clients.reduce(
    (total, client) => total + client.totalOrders,
    0
  );

  // Calculate top brands data
  const brandCount: { [key: string]: number } = {};
  agentDetails.clients.forEach((client) => {
    client.movements.forEach((movement) => {
      movement.details.forEach((detail) => {
        if (detail.brand) {
          if (!brandCount[detail.brand]) {
            brandCount[detail.brand] = 0;
          }
          brandCount[detail.brand] += 1;
        }
      });
    });
  });
  const topBrandsData = Object.keys(brandCount)
    .map((brand) => ({
      label: brand,
      value: brandCount[brand],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Calculate sales distribution data
  const topClients = [...agentDetails.clients]
    .sort((a, b) => parseFloat(b.totalRevenue) - parseFloat(a.totalRevenue))
    .slice(0, isMobile ? 5 : 25);
  const salesDistributionData = topClients.map((client) => ({
    label: client.name,
    value: parseFloat(client.totalRevenue),
  }));

  const brandColors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#FF6384",
  ];

  return (
    <Box className="agent-dashboard" sx={{ p: isMobile ? 0 : 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome back, {agentDetails.name}
      </Typography>
      <GlobalSearch filter="client" onSelect={handleClientSelect} />
      <Grid container spacing={4} mt={2}>
        <Grid item xs={12} md={8}>
          {selectedClient ? (
            <Box mb={4}>
              <Typography variant="h5" gutterBottom>
                Statistics for {selectedClient.name}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h6">Spent This Month</Typography>
                    <Typography variant="body1">
                      €{calculateTotalSpentThisMonth(selectedClient.movements)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h6">Spent This Year</Typography>
                    <Typography variant="body1">
                      €{calculateTotalSpentThisYear(selectedClient.movements)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h6">Top Article Type</Typography>
                    <Typography variant="body1">
                      {calculateTopArticleType(selectedClient.movements)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h6">
                      Month Over Month Spending Trend
                    </Typography>
                    <Typography variant="body1">Chart here</Typography>
                  </Paper>
                </Grid>
              </Grid>
              <Button variant="contained" color="primary" sx={{ mt: 3 }}>
                View More
              </Button>
              <Fab
                color="secondary"
                aria-label="close"
                sx={{ position: "fixed", bottom: 16, right: 16 }}
                onClick={() => selectClient("")}
              >
                <CloseIcon />
              </Fab>
            </Box>
          ) : (
            <Box mb={4}>
              <Typography variant="h5" gutterBottom>
                Your Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h6">Total Revenue</Typography>
                    <Typography variant="body1" sx={{ paddingBottom: "10px" }}>
                      Revenue: €{totalRevenue}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h6">Total Orders</Typography>
                    <Typography variant="body1">
                      Orders: {totalOrders}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h6">Top Brands Sold</Typography>
                    <PieChart
                      colors={brandColors}
                      series={[
                        {
                          data: topBrandsData,
                          outerRadius: 80,
                          highlightScope: {
                            faded: "global",
                            highlighted: "item",
                          },
                          faded: {
                            innerRadius: 30,
                            additionalRadius: -30,
                            color: "gray",
                          },
                        },
                      ]}
                      height={200}
                      slotProps={{
                        legend: {
                          hidden: isMobile,
                        },
                      }}
                      sx={{
                        position: "absolute",
                        left: isMobile ? "50px" : "auto",
                        right: isMobile ? "auto" : "50px",
                      }}
                    />
                    {isMobile && (
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        mt={2}
                      >
                        {topBrandsData.map((brand, index) => (
                          <Box
                            key={brand.label}
                            display="flex"
                            alignItems="center"
                            mb={1}
                          >
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                backgroundColor: brandColors[index],
                                marginRight: 1,
                              }}
                            />
                            <Typography variant="body2">
                              {brand.label}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper elevation={3} sx={{ p: 0 }}>
                    <Typography variant="h6" sx={{ padding: "12px" }}>
                      Sales Distribution Through Clients
                    </Typography>
                    <Box
                      sx={{ width: "100%", height: "300px", padding: "10px" }}
                    >
                      <BarChart
                        xAxis={[{ scaleType: "band", dataKey: "label" }]}
                        yAxis={[{ scaleType: "linear" }]}
                        series={[{ dataKey: "value", label: "Revenue" }]}
                        dataset={salesDistributionData}
                        layout="vertical"
                      />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
          <Box mb={4}>
            <Typography variant="h5" gutterBottom>
              {selectedClient
                ? `Upcoming Visits for ${selectedClient.name}`
                : "Your Upcoming Visits"}
            </Typography>
            <List>
              {selectedClient ? (
                selectedClient.visits.map((visit, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={`${visit.note} on ${visit.date}`} />
                  </ListItem>
                ))
              ) : (
                <>
                  <ListItem>
                    <ListItemText primary="Visit 1" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Visit 2" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Visit 3" />
                  </ListItem>
                </>
              )}
            </List>
            <Button variant="contained" color="primary" sx={{ mt: 3 }}>
              Plan Visit
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box mb={4}>
            <Typography variant="h5" gutterBottom>
              Calendar
            </Typography>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="body1">
                Calendar integration goes here.
              </Typography>
            </Paper>
          </Box>
          <Box>
            <Typography variant="h5" gutterBottom>
              {selectedClient
                ? `Active Promotions for ${selectedClient.name}`
                : "Active Promotions with Your Clients"}
            </Typography>
            <List>
              {selectedClient ? (
                selectedClient.promos.map((promo) => (
                  <ListItem key={promo.id}>
                    <ListItemText primary={promo.name} />
                  </ListItem>
                ))
              ) : (
                <>
                  <ListItem>
                    <ListItemText primary="Promo 1" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Promo 2" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Promo 3" />
                  </ListItem>
                </>
              )}
            </List>
            <Button variant="contained" color="primary" sx={{ mt: 3 }}>
              View More
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default React.memo(AgentDashboard);
