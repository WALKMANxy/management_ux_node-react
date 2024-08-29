import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  clearSelection,
  selectAgent,
  selectClient,
} from "../features/data/dataSlice";
import { SearchResult } from "../models/searchModels";
import useStats from "./useStats";
import { UseSelectionStateReturn } from "../models/dataSetTypes";

const useSelectionState = (isMobile: boolean): UseSelectionStateReturn => {  const dispatch = useDispatch();
  const {
    selectedClient,
    selectedAgent,
    clientComparativeStatistics,
    clientComparativeStatisticsMonthly,
    agentComparativeStatistics,
    agentComparativeStatisticsMonthly,
  } = useStats(isMobile);

  const handleSelect = useCallback(
    (item: SearchResult) => {
      // Clear previous selections
      dispatch(clearSelection());

      if (item.type === "client") {
        sessionStorage.setItem("selectedItem", JSON.stringify(item));
        dispatch(selectClient(item.id)); // Assuming item.id is the client's id
      } else if (item.type === "agent") {
        sessionStorage.setItem("selectedItem", JSON.stringify(item));
        dispatch(selectAgent(item.id)); // Assuming item.id is the agent's id
      } else {
        console.log(`Selected ${item.type}: ${item.name}`);
      }
    },
    [dispatch]
  );

  const handleClearSelection = useCallback(() => {
    dispatch(clearSelection());
    sessionStorage.removeItem("selectedItem");
  }, [dispatch]);

  useEffect(() => {
    const selectedItem = sessionStorage.getItem("selectedItem");
    if (selectedItem) {
      try {
        const item = JSON.parse(selectedItem);
        if (item.type === "client") {
          dispatch(selectClient(item.id));
        } else if (item.type === "agent") {
          dispatch(selectAgent(item.id));
        }
      } catch (error) {
        console.error(
          "Failed to parse selected item from session storage:",
          error
        );
        sessionStorage.removeItem("selectedItem");
      }
    }
  }, [dispatch]);

  return {
    selectedClient,
    selectedAgent,
    handleSelect,
    clearSelection: handleClearSelection,
    clientComparativeStatistics,
    clientComparativeStatisticsMonthly,
    agentComparativeStatistics,
    agentComparativeStatisticsMonthly,
  };
};

export default useSelectionState;
