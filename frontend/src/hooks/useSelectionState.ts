import { useCallback, useEffect } from "react";
import { SearchResult } from "../models/models";
import useStats from "./useStats"; // Adjust the import path as necessary

const useSelectionState = (isMobile: boolean) => {
  const {
    selectedClient,
    selectedAgent,
    selectClient,
    selectAgent,
    clearSelection,
    clientComparativeStatistics,
    clientComparativeStatisticsMonthly,
    agentComparativeStatistics,
    agentComparativeStatisticsMonthly,
  } = useStats(isMobile); // Use "admin" for the userRole

  const handleSelect = useCallback(
    (item: SearchResult) => {
      // Clear previous selections
      clearSelection();

      if (item.type === "client") {
        sessionStorage.setItem("selectedItem", JSON.stringify(item));
        selectClient(item.name);
      } else if (item.type === "agent") {
        sessionStorage.setItem("selectedItem", JSON.stringify(item));
        selectAgent(item.name);
      } else {
        console.log(`Selected ${item.type}: ${item.name}`);
      }
    },
    [selectClient, selectAgent, clearSelection]
  );

  useEffect(() => {
    const selectedItem = sessionStorage.getItem("selectedItem");
    if (selectedItem) {
      const item = JSON.parse(selectedItem);
      if (item.type === "client") {
        selectClient(item.name);
      } else if (item.type === "agent") {
        selectAgent(item.name);
      }
    }
  }, [selectClient, selectAgent]);

  return {
    selectedClient,
    selectedAgent,
    handleSelect,
    clearSelection,
    clientComparativeStatistics,
    clientComparativeStatisticsMonthly,
    agentComparativeStatistics,
    agentComparativeStatisticsMonthly,
  };
};

export default useSelectionState;
