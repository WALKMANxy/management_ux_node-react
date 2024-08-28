import { useCallback, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Agent, Client } from "../models/entityModels";
import { AgGridReact } from "ag-grid-react";
import { DataSliceState } from "../models/stateModels";

export const useClientsGrid = () => {
  // Get the pre-filtered clients and agent details from Redux store
  const clients = useSelector((state: DataSliceState) => state.clients);
  const agentDetails = useSelector((state: DataSliceState) => state.agentDetails);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientListCollapsed, setClientListCollapsed] = useState(false);
  const [isClientDetailsCollapsed, setClientDetailsCollapsed] = useState(false);
  const [quickFilterText, setQuickFilterText] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const gridRef = useRef<AgGridReact>(null);
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

  const addAgentNameToClient = useCallback((client: Client, agentDetails: Record<string, Agent>) => {
    const agent = agentDetails[client.agent];
    return {
      ...client,
      agentName: agent ? agent.name : "Unknown Agent",
    };
  }, []);

  const handleClientSelect = useCallback(
    (clientId: string) => {
      const client = clients[clientId] || null;
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
    [clients, agentDetails, addAgentNameToClient]
  );

  return {
    clients: Object.values(clients), // Convert the object to an array for easier use in components
    selectedClient,
    setSelectedClient,
    quickFilterText,
    setQuickFilterText,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleClientSelect,
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
