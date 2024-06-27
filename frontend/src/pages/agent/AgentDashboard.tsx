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
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarComponent from "../../components/common/CalendarComponent";
import TopBrandsSold from "../../components/charts/TopBrandSold";
import SalesDistribution from "../../components/charts/SalesDistribution";
import MonthOverMonthSpendingTrend from "../../components/charts/MonthOverMonthSpendingTrend";
import { setVisits } from "../../features/calendar/calendarSlice";
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

  const totalRevenue = agentDetails
    ? calculateTotalRevenue(agentDetails.clients)
    : [];
  const totalOrders = agentDetails
    ? calculateTotalOrders(agentDetails.clients)
    : [];
  const topBrandsData = agentDetails
    ? calculateTopBrandsData(agentDetails.clients)
    : [];
  const salesDistributionData = agentDetails
    ? calculateSalesDistributionData(agentDetails.clients, isMobile)
    : [];

  const { months, revenueData } = agentDetails
    ? calculateMonthlyRevenue(agentDetails.clients)
    : { months: [], revenueData: [] };

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
    backgroundColor: "rgba(0, 0, 0, 1%)",
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
        {agentDetails ? (
          <>Welcome back, {agentDetails.name}</>
        ) : (
          <Skeleton width="30%" />
        )}
      </Typography>
      {agentDetails ? (
        <GlobalSearch filter="client" onSelect={handleClientSelect} />
      ) : (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={50}
          sx={{ borderRadius: "12px" }}
        />
      )}
      <Grid container spacing={4} mt={2}>
        <Grid item xs={12} md={8}>
          {selectedClient ? (
            <Box mb={4}>
              <Typography variant="h5" gutterBottom>
                Statistics for {selectedClient.name}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  {agentDetails ? (
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
                        €
                        {calculateTotalSpentThisMonth(selectedClient.movements)}
                      </Typography>
                    </Paper>
                  ) : (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={200}
                      sx={{ borderRadius: "12px" }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  {agentDetails ? (
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
                  ) : (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={200}
                      sx={{ borderRadius: "12px" }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  {agentDetails ? (
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
                  ) : (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={200}
                      sx={{ borderRadius: "12px" }}
                    />
                  )}
                </Grid>
                <Grid item xs={12}>
                  {agentDetails ? (
                    <MonthOverMonthSpendingTrend
                      months={months}
                      revenueData={revenueData}
                    />
                  ) : (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={300}
                      sx={{ borderRadius: "12px" }}
                    />
                  )}
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
              <Typography variant="h5" gutterBottom>
                {agentDetails ? "Your Statistics" : <Skeleton width="40%" />}
              </Typography>

              <Divider sx={{ my: 2, borderRadius: "12px" }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  {agentDetails ? (
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
                      <Typography
                        variant="body1"
                        sx={{ paddingBottom: "10px" }}
                      >
                        Revenue: €{totalRevenue}
                      </Typography>
                    </Paper>
                  ) : (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={200}
                      sx={{ borderRadius: "12px" }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  {agentDetails ? (
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
                  ) : (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={200}
                      sx={{ borderRadius: "12px" }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={8}>
                  {agentDetails ? (
                    <MonthOverMonthSpendingTrend
                      months={months}
                      revenueData={revenueData}
                    />
                  ) : (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={300}
                      sx={{ borderRadius: "12px" }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  {agentDetails ? (
                    <TopBrandsSold
                      topBrandsData={topBrandsData}
                      brandColors={brandColors}
                      isMobile={isMobile}
                    />
                  ) : (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={300}
                      sx={{ borderRadius: "12px" }}
                    />
                  )}
                </Grid>
                <Grid item xs={12}>
                  {agentDetails ? (
                    <SalesDistribution
                      salesDistributionData={salesDistributionData}
                    />
                  ) : (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={300}
                      sx={{ borderRadius: "12px" }}
                    />
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
          <Box mb={4}>
            <Typography variant="h5" gutterBottom>
              {selectedClient ? (
                `Upcoming Visits for ${selectedClient.name}`
              ) : agentDetails ? (
                "Your Upcoming Visits"
              ) : (
                <Skeleton width="50%" />
              )}
            </Typography>

            <Divider sx={{ my: 2, borderRadius: "12px" }} />
            {agentDetails ? (
              <List>
                {selectedClient ? (
                  selectedClient.visits.map((visit, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`${visit.note} on ${visit.date}`}
                      />
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
            ) : (
              <Skeleton
                variant="rectangular"
                width="100%"
                height={200}
                sx={{ borderRadius: "12px" }}
              />
            )}
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
            <Typography variant="h5" gutterBottom>
              {agentDetails ? "Calendar" : <Skeleton width="30%" />}
            </Typography>

            <Divider sx={{ my: 2, borderRadius: "12px" }} />
            {agentDetails ? (
              <CalendarComponent />
            ) : (
              <Skeleton
                variant="rectangular"
                width="100%"
                height={300}
                sx={{ borderRadius: "12px" }}
              />
            )}
          </Box>
          <Box>
            <Typography variant="h5" gutterBottom>
              {selectedClient ? (
                `Active Promotions for ${selectedClient.name}`
              ) : agentDetails ? (
                "Active Promotions with Your Clients"
              ) : (
                <Skeleton width="50%" />
              )}
            </Typography>

            <Divider sx={{ my: 2, borderRadius: "12px" }} />
            {agentDetails ? (
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
            ) : (
              <Skeleton
                variant="rectangular"
                width="100%"
                height={200}
                sx={{ borderRadius: "12px" }}
              />
            )}
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
