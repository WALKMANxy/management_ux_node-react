import { AgGridReact } from "ag-grid-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Movement } from "../models/dataModels";
import { Client } from "../models/entityModels";
import { DataSliceState } from "../models/stateModels";

export const useMovementsGrid = () => {
  // Access clients and agent details directly from the Redux store
  const clients = useSelector((state: DataSliceState) => state.clients);
  const agentDetails = useSelector(
    (state: DataSliceState) => state.agentDetails
  );

  const userRole = useSelector((state: DataSliceState) => {
    const currentUserDetails = state.currentUserDetails;
    return currentUserDetails ? currentUserDetails.role : null;
  });
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

  // Handle menu open/close
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Export data as CSV
  const exportDataAsCsv = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.api.exportDataAsCsv();
    }
  }, []);

  // Create a map of agent IDs to agent names
  const agentMap = useMemo(() => {
    const map: Record<string, string> = {};
    Object.values(agentDetails).forEach((agent) => {
      map[agent.id] = agent.name;
    });
    return map;
  }, [agentDetails]);

  // Enrich clients with agent names
  const enrichedClients = useMemo(() => {
    return Object.values(clients).map((client) => ({
      ...client,
      agentName: agentMap[client.agent] || "Unknown Agent",
    }));
  }, [clients, agentMap]);

  // Handle movement selection
  const handleMovementSelect = useCallback(
    (movementId: string) => {
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
    },
    [enrichedClients]
  );

  // Filter movements based on search criteria
  const filteredMovements = useCallback(() => {
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
          agentName: client.agentName || "Unknown Agent",
        }))
    );

    if (quickFilterText) {
      movements = movements.filter((movement) =>
        movement.details.some((detail) =>
          detail.name.toLowerCase().includes(quickFilterText.toLowerCase())
        )
      );
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      movements = movements.filter((movement) => {
        const movementDate = new Date(movement.dateOfOrder);
        return movementDate >= start && movementDate <= end;
      });
    }

    return movements;
  }, [enrichedClients, quickFilterText, startDate, endDate]);

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
    userRole,
  };
};
