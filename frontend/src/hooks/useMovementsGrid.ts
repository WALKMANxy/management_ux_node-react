// src/hooks/useMovementsGrid.ts
import { useCallback, useRef, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { useGetClientsQuery, useGetAgentDetailsQuery } from "../services/api";
import { Client, Movement } from "../models/models";

export const useMovementsGrid = () => {
  const { data: clients = [] } = useGetClientsQuery();
  const { data: agentDetails = [] } = useGetAgentDetailsQuery();
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(
    null
  );
  const [isMovementListCollapsed, setMovementListCollapsed] = useState(false);
  const [isMovementDetailsCollapsed, setMovementDetailsCollapsed] =
    useState(false);
  const [quickFilterText, setQuickFilterText] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const gridRef = useRef<any>(null);
  const movementDetailsRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const userRole = useSelector((state: RootState) => state.auth.userRole);
  const userId = useSelector((state: RootState) => state.auth.id);

  /* useEffect(() => {
    console.log("Clients:", clients);
    console.log("Agent Details:", agentDetails);
    console.log("User Role:", userRole);
    console.log("User ID:", userId);
  }, [clients, agentDetails, userRole, userId]);
 */
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const exportDataAsCsv = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.api.exportDataAsCsv();
    }
  }, []);

  // Create a map of agent IDs to agent names
  const agentMap = useMemo(() => {
    const map: Record<string, string> = {};
    agentDetails.forEach((agent) => {
      map[agent.id] = agent.name;
    });
    return map;
  }, [agentDetails]);

  // Add agent names to clients
  const enrichedClients = useMemo(() => {
    return clients.map((client) => ({
      ...client,
      agentName: agentMap[client.agent] || "Unknown Agent",
    }));
  }, [clients, agentMap]);

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

    if (userRole === "agent") {
      movements = movements.filter((movement) =>
        enrichedClients.some(
          (client) => client.agent === userId && client.id === movement.clientId
        )
      );
    } else if (userRole === "client") {
      movements = movements.filter((movement) =>
        enrichedClients.some(
          (client) => client.id === userId && client.id === movement.clientId
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
  }, [enrichedClients, userRole, userId, startDate, endDate]);

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
