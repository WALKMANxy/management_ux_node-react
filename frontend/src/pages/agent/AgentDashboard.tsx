import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
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
  Fab,
  useMediaQuery,
  useTheme,
  Skeleton,
  Stack,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarComponent from "../../components/common/CalendarComponent";
import { setVisits } from "../../features/calendar/calendarSlice";
import TopBrandsSold from "../../components/charts/TopBrandSold";
import SalesDistribution from "../../components/charts/SalesDistribution";
import MonthOverMonthSpendingTrend from "../../components/charts/MonthOverMonthSpendingTrend";
import {
  calculateTotalRevenue,
  calculateTotalOrders,
  calculateTopBrandsData,
  calculateSalesDistributionData,
} from "../../utils/dataUtils";
import { calculateMonthlyRevenue } from "../../utils/dataLoader";

const AgentDashboard: React.FC = () => {
  const dispatch = useDispatch();
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

  useEffect(() => {
    if (agentDetails) {
      dispatch(
        setVisits(agentDetails.clients.flatMap((client) => client.visits))
      );
    }
  }, [agentDetails, dispatch]);

  if (!agentDetails) {
    return (
      <Box className="agent-dashboard" sx={{ p: isMobile ? 0 : 4 }}>
        <Stack spacing={2}>
          <Skeleton
            variant="text"
            sx={{ fontSize: "2rem", borderRadius: "8px" }}
            width="60%"
          />
          <Skeleton
            variant="rectangular"
            width="100%"
            height={300}
            sx={{ borderRadius: "8px" }}
          />
          <Skeleton
            variant="rectangular"
            width="100%"
            height={300}
            sx={{ borderRadius: "8px" }}
          />
        </Stack>
      </Box>
    );
  }

  const totalRevenue = calculateTotalRevenue(agentDetails.clients);
  const totalOrders = calculateTotalOrders(agentDetails.clients);
  const topBrandsData = calculateTopBrandsData(agentDetails.clients);
  const salesDistributionData = calculateSalesDistributionData(
    agentDetails.clients,
    isMobile
  );

  const { months, revenueData } = calculateMonthlyRevenue(agentDetails.clients);

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
  ];

  const gradients = [
    "linear-gradient(135deg, #fffde7 30%, #fff9c4 100%)",
    "linear-gradient(135deg, #ffe0b2 30%, #ffcc80 100%)",
    "linear-gradient(135deg, #e8f5e9 30%, #c8e6c9 100%)",
    "linear-gradient(135deg, #f3e5f5 30%, #e1bee7 100%)",
  ];

  const titleBoxStyle = {
    display: "inline-block",
    backgroundColor: "rgba(0, 0, 0, 3%)",
    borderRadius: "24px",
    px: 2,
    py: 0.5,
    mb: 2.5,
  };

  return (
    <Box
      className="agent-dashboard"
      sx={{ p: isMobile ? 0 : 4, bgcolor: "#f4f5f7" }}
    >
      <Typography variant="h4" gutterBottom>
        Welcome back, {agentDetails.name}
      </Typography>
      <GlobalSearch filter="client" onSelect={handleClientSelect} />
      <Grid container spacing={4} mt={2}>
        <Grid item xs={12} md={8}>
          {selectedClient ? (
            <Box mb={4}>
              <Box sx={titleBoxStyle}>
                <Typography variant="h5" gutterBottom>
                  Statistics for {selectedClient.name}
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      borderRadius: "12px",
                      background: gradients[0],
                    }}
                  >
                    <Box sx={titleBoxStyle}>
                      <Typography variant="h6">Spent This Month</Typography>
                    </Box>
                    <Typography variant="body1">
                      €{calculateTotalSpentThisMonth(selectedClient.movements)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      borderRadius: "12px",
                      background: gradients[1],
                    }}
                  >
                    <Box sx={titleBoxStyle}>
                      <Typography variant="h6">Spent This Year</Typography>
                    </Box>
                    <Typography variant="body1">
                      €{calculateTotalSpentThisYear(selectedClient.movements)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      borderRadius: "12px",
                      background: gradients[2],
                    }}
                  >
                    <Box sx={titleBoxStyle}>
                      <Typography variant="h6">Top Article Type</Typography>
                    </Box>
                    <Typography variant="body1">
                      {calculateTopArticleType(selectedClient.movements)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <MonthOverMonthSpendingTrend
                    months={months}
                    revenueData={revenueData}
                  />
                </Grid>
              </Grid>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 3, borderRadius: "8px" }}
              >
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
              <Box sx={titleBoxStyle}>
                <Typography variant="h5" gutterBottom>
                  Your Statistics
                </Typography>
              </Box>
              <Divider sx={{ my: 2, borderRadius: "12px" }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      borderRadius: "12px",
                      background: gradients[3],
                    }}
                  >
                    <Box sx={titleBoxStyle}>
                      <Typography variant="h6">Total Revenue</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ paddingBottom: "10px" }}>
                      Revenue: €{totalRevenue}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      borderRadius: "12px",
                      background: gradients[0],
                    }}
                  >
                    <Box sx={titleBoxStyle}>
                      <Typography variant="h6">Total Orders</Typography>
                    </Box>
                    <Typography variant="body1">
                      Orders: {totalOrders}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TopBrandsSold
                    topBrandsData={topBrandsData}
                    brandColors={brandColors}
                    isMobile={isMobile}
                  />
                </Grid>
                <Grid item xs={12}>
                  <SalesDistribution
                    salesDistributionData={salesDistributionData}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
          <Box mb={4}>
            <Box sx={titleBoxStyle}>
              <Typography variant="h5" gutterBottom>
                {selectedClient
                  ? `Upcoming Visits for ${selectedClient.name}`
                  : "Your Upcoming Visits"}
              </Typography>
            </Box>
            <Divider sx={{ my: 2, borderRadius: "12px" }} />
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
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 3, borderRadius: "8px" }}
            >
              Plan Visit
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box mb={4}>
            <Box sx={titleBoxStyle}>
              <Typography variant="h5" gutterBottom>
                Calendar
              </Typography>
            </Box>
            <Divider sx={{ my: 2, borderRadius: "12px" }} />
            <CalendarComponent />
          </Box>
          <Box>
            <Box sx={titleBoxStyle}>
              <Typography variant="h5" gutterBottom>
                {selectedClient
                  ? `Active Promotions for ${selectedClient.name}`
                  : "Active Promotions with Your Clients"}
              </Typography>
            </Box>
            <Divider sx={{ my: 2, borderRadius: "12px" }} />
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
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 3, borderRadius: "8px" }}
            >
              View More
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default React.memo(AgentDashboard);
