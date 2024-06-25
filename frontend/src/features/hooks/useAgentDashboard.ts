// src/hooks/useAgentDashboard.ts
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../app/store";
import { setVisits } from "../../features/calendar/calendarSlice";
import {
  calculateTotalRevenue,
  calculateTotalOrders,
  calculateTopBrandsData,
  calculateSalesDistributionData,
} from "../../utils/dataUtils";
import { useMediaQuery, useTheme } from "@mui/material";
import { Client } from "../../models/models";
import useAgentStats from "./useAgentStats";

const useAgentDashboard = () => {
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

  useEffect(() => {
    if (agentDetails) {
      dispatch(
        setVisits(
          agentDetails.clients.flatMap((client: Client) => client.visits)
        )
      );
    }
  }, [agentDetails, dispatch]);

  const totalRevenue = agentDetails ? calculateTotalRevenue(agentDetails.clients) : 0;
  const totalOrders = agentDetails ? calculateTotalOrders(agentDetails.clients) : 0;
  const topBrandsData = agentDetails ? calculateTopBrandsData(agentDetails.clients) : [];
  const salesDistributionData = agentDetails ? calculateSalesDistributionData(agentDetails.clients, isMobile) : [];

  return {
    agentDetails,
    selectedClient,
    selectClient,
    calculateTotalSpentThisMonth,
    calculateTotalSpentThisYear,
    calculateTopArticleType,
    totalRevenue,
    totalOrders,
    topBrandsData,
    salesDistributionData,
    isMobile,
  };
};

export default useAgentDashboard;
