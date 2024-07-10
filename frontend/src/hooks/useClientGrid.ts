import { useCallback,  useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { Agent, Client } from "../models/models";
import { useGetClientsQuery, useGetAgentDetailsQuery } from "../services/api";

export const useClientsGrid = () => {
  const { data: clients = [] } = useGetClientsQuery();
  const { data: agentDetails = [] } = useGetAgentDetailsQuery();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientListCollapsed, setClientListCollapsed] = useState(false);
  const [isClientDetailsCollapsed, setClientDetailsCollapsed] = useState(false);
  const userRole = useSelector((state: RootState) => state.auth.userRole);
  const userId = useSelector((state: RootState) => state.auth.id);
  const [quickFilterText, setQuickFilterText] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const gridRef = useRef<any>(null);
  const clientDetailsRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

  const addAgentNameToClient = (client: Client, agentDetails: Agent[]) => {
    const agent = agentDetails.find((agent) => agent.id === client.agent);
    return {
      ...client,
      agentName: agent ? agent.name : "Unknown Agent",
    };
  };

  const handleClientSelect = useCallback(
    (clientId: string) => {
      const client = clients.find((client) => client.id === clientId) || null;
      if (client) {
        const clientWithAgentName = addAgentNameToClient(client, agentDetails);
        setSelectedClient(clientWithAgentName);
        setTimeout(() => {
          if (clientDetailsRef.current) {
            clientDetailsRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 0);
      } else {
        setSelectedClient(null);
      }
    },
    [clients, agentDetails]
  );
  
  
  
  const filteredClients = useCallback(() => {
    let filtered = clients;
    if (userRole === "agent") {
      filtered = filtered.filter((client) => client.agent === userId);
    } else if (userRole === "client") {
      filtered = filtered.filter((client) => client.id === userId);
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = filtered.filter((client) => {
        return client.movements.some((movement) => {
          const movementDate = new Date(movement.dateOfOrder);
          return movementDate >= start && movementDate <= end;
        });
      });
    }
    return filtered.map((client) => addAgentNameToClient(client, agentDetails));
  }, [clients, userRole, userId, startDate, endDate, agentDetails]);
  
  
  

  return {
    clients, 
    selectedClient,
    setSelectedClient,
    quickFilterText,
    setQuickFilterText,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleClientSelect,
    filteredClients,
    gridRef,
    clientDetailsRef,
    isClientListCollapsed,
    setClientListCollapsed,
    isClientDetailsCollapsed,
    setClientDetailsCollapsed,
    handleMenuOpen,
    handleMenuClose,
    anchorEl,
    exportDataAsCsv,
  };
};
