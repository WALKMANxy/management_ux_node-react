// src/hooks/useMovementsGrid.ts
import { AgGridReact } from "ag-grid-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { Movement } from "../models/dataModels";
import { Client } from "../models/entityModels";
import { showToast } from "../utils/toastMessage";

export const useMovementsGrid = () => {
  const { t } = useTranslation(); // Initialize translation

  const clients = Object.values(
    useSelector((state: RootState) => state.data.clients)
  );
  const agentDetails = Object.values(
    useSelector((state: RootState) => state.data.agents)
  );
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(
    null
  );
  const [isMovementListCollapsed, setMovementListCollapsed] = useState(false);
  const [isMovementDetailsCollapsed, setMovementDetailsCollapsed] =
    useState(false);
  const [quickFilterText, setQuickFilterText] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const gridRef = useRef<AgGridReact>(null);
  const movementDetailsRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const userRole = useSelector((state: RootState) => state.auth.role);

  /* useEffect(() => {
    console.log("Clients:", clients);
    console.log("Agent Details:", agentDetails);
    console.log("User Role:", userRole);
    console.log("User ID:", userId);
  }, [clients, agentDetails, userRole, userId]);
 */
  // Handle menu open
  const handleMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    []
  );

  // Handle menu close
  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Export data as CSV
  const exportDataAsCsv = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.api.exportDataAsCsv();
    }
  }, []);

  // Memoize agentMap to prevent unnecessary recalculations
  const agentMap = useMemo(() => {
    const map: Record<string, string> = {};
    agentDetails.forEach((agent) => {
      map[agent.id] = agent.name;
    });
    return map;
  }, [agentDetails]);

  // Enrich clients with agent names
  const enrichedClients = useMemo(() => {
    return clients.map((client) => ({
      ...client,
      agentName: agentMap[client.agent] || t("movementsGrid.unknownAgent"),
    }));
  }, [clients, agentMap, t]);

  // Error Handling: No explicit error-prone operations, but adding try-catch for DOM interactions
  const handleMovementSelect = useCallback(
    (movementId: string) => {
      try {
        const allMovements: Movement[] = enrichedClients.flatMap(
          (client: Client) => client.movements
        );
        const movement =
          allMovements.find((movement) => movement.id === movementId) || null;
        setSelectedMovement(movement);
        setTimeout(() => {
          if (movementDetailsRef.current) {
            movementDetailsRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 0);
      } catch (error: unknown) {
        if (error instanceof Error) {
          showToast.error(
            t("movementsGrid.selectionError", { message: error.message })
          );
          console.error("Error selecting movement:", error);
        } else {
          showToast.error(t("movementsGrid.unknownError"));
          console.error("Unknown error selecting movement:", error);
        }
      }
    },
    [enrichedClients, t]
  );

  // Memoize filteredMovements without role-based filtering
  const filteredMovements = useMemo(() => {
    type EnrichedMovement = Movement & {
      clientId: string;
      clientName: string;
      agentName: string;
    };

    let movements: EnrichedMovement[] = enrichedClients.flatMap(
      (client: Client) =>
        client.movements.map((movement) => ({
          ...movement,
          clientId: client.id,
          clientName: client.name,
          agentName: client.agentName || t("movementsGrid.unknownAgent"),
        }))
    );

    // Date Filtering
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      movements = movements.filter((movement) => {
        const movementDate = new Date(movement.dateOfOrder);
        return movementDate >= start && movementDate <= end;
      });
    }

    // Sort movements by dateOfOrder, newest first
    movements.sort(
      (a, b) =>
        new Date(b.dateOfOrder).getTime() - new Date(a.dateOfOrder).getTime()
    );

    return movements;
  }, [enrichedClients, startDate, endDate, t]);

  useEffect(() => {
    if (selectedMovement) {
      console.log("Selected Movement:", selectedMovement);
    }
  }, [selectedMovement]);

  return {
    clients: enrichedClients,
    selectedMovement,
    setSelectedMovement,
    quickFilterText,
    setQuickFilterText,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleMovementSelect,
    filteredMovements,
    gridRef,
    movementDetailsRef,
    isMovementListCollapsed,
    setMovementListCollapsed,
    isMovementDetailsCollapsed,
    setMovementDetailsCollapsed,
    handleMenuOpen,
    handleMenuClose,
    anchorEl,
    exportDataAsCsv,
    userRole, // Added userRole to return object
  };
};
