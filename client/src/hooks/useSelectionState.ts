// src/hooks/useSelectionState.ts
import { useCallback, useEffect } from "react";
import { useAppDispatch } from "../app/hooks";
import {
  clearSelection,
  selectAgent,
  selectClient,
} from "../features/data/dataSlice";
import { UseSelectionStateReturn } from "../models/dataSetTypes";
import { SearchResult } from "../models/searchModels";
import useStats from "./useStats";

/**
 * Custom hook to manage the selection state of clients and agents.
 *
 * @param {boolean} isMobile - Flag indicating if the view is on a mobile device.
 * @returns {UseSelectionStateReturn} - An object containing selection state and handlers.
 *
 * @example
 * const {
 *   selectedClient,
 *   selectedAgent,
 *   handleSelect,
 *   clearSelection,
 *   clientComparativeStatistics,
 *   clientComparativeStatisticsMonthly,
 *   agentComparativeStatistics,
 *   agentComparativeStatisticsMonthly,
 * } = useSelectionState(isMobile);
 */
const useSelectionState = (isMobile: boolean): UseSelectionStateReturn => {
  const dispatch = useAppDispatch();
  const {
    selectedClient,
    selectedAgent,
    clientComparativeStatistics,
    clientComparativeStatisticsMonthly,
    agentComparativeStatistics,
    agentComparativeStatisticsMonthly,
  } = useStats(isMobile);

  // Handler to select a client or agent based on the SearchResult type
  const handleSelect = useCallback(
    (item: SearchResult) => {
      // Clear previous selections
      dispatch(clearSelection());

      // Validate item structure before proceeding
      if (!item || !item.type || !item.id) {
        console.error("Invalid item selected:", item);
        return;
      }

      // Persist selected item in sessionStorage
      try {
        sessionStorage.setItem("selectedItem", JSON.stringify(item));
      } catch (error) {
        console.error("Failed to save selected item to sessionStorage:", error);
      }

      // Dispatch appropriate selection action based on item type
      if (item.type === "client") {
        dispatch(selectClient(item.id));
      } else if (item.type === "agent") {
        dispatch(selectAgent(item.id));
      } else {
        console.warn(`Unknown item type selected: ${item.type}`);
      }
    },
    [dispatch]
  );

  // Handler to clear the current selection
  const handleClearSelection = useCallback(() => {
    dispatch(clearSelection());
    try {
      sessionStorage.removeItem("selectedItem");
    } catch (error) {
      console.error(
        "Failed to remove selected item from sessionStorage:",
        error
      );
    }
  }, [dispatch]);

  // Effect to initialize selection from sessionStorage on mount
  useEffect(() => {
    const selectedItem = sessionStorage.getItem("selectedItem");
    if (selectedItem) {
      try {
        const item: SearchResult = JSON.parse(selectedItem);
        if (item.type === "client") {
          dispatch(selectClient(item.id));
        } else if (item.type === "agent") {
          dispatch(selectAgent(item.id));
        } else {
          console.warn(`Unknown item type in sessionStorage: ${item.type}`);
        }
      } catch (error) {
        console.error(
          "Failed to parse selected item from sessionStorage:",
          error
        );
        try {
          sessionStorage.removeItem("selectedItem");
        } catch (removeError) {
          console.error(
            "Failed to remove invalid selected item from sessionStorage:",
            removeError
          );
        }
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
