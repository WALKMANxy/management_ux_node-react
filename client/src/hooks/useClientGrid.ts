//src/hooks/useClientGrid.ts
import { AgGridReact } from "ag-grid-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { Agent, Client } from "../models/entityModels";
import { showToast } from "../services/toastMessage";

export const useClientsGrid = () => {
  const { t } = useTranslation();

  const [error, setError] = useState<string | null>(null);

  const clients = Object.values(
    useSelector((state: RootState) => state.data.clients)
  );
  const agentDetails = Object.values(
    useSelector((state: RootState) => state.data.agents)
  );
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientListCollapsed, setClientListCollapsed] = useState(false);
  const [isClientDetailsCollapsed, setClientDetailsCollapsed] = useState(false);
  const [quickFilterText, setQuickFilterText] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const gridRef = useRef<AgGridReact>(null);
  const clientDetailsRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Error Handling: Display toast when an error occurs
  useEffect(() => {
    if (error) {
      showToast.error(error);
      setError(null);
    }
  }, [error]);

  // Handlers for menu
  const handleMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    []
  );

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const exportDataAsCsv = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.api.exportDataAsCsv();
    }
  }, []);

  // Helper function to add agent name to client
  const addAgentNameToClient = useCallback(
    (client: Client, agents: Agent[]): Client & { agentName: string } => {
      const agent = agents.find((agent) => agent.id === client.agent);
      return {
        ...client,
        agentName: agent ? agent.name : t("clients.unknownAgent"),
      };
    },
    [t]
  );

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
    [clients, agentDetails, addAgentNameToClient]
  );


  const clientsWithAgentNames = useMemo(() => {
    try {
      // Add agent names and then sort clients alphabetically by name
      return clients
        .map((client) => addAgentNameToClient(client, agentDetails))
        .sort((a, b) => a.name.localeCompare(b.name));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || t("errors.unknown"));
      return [];
    }
  }, [clients, agentDetails, addAgentNameToClient, t]);

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
    filteredClients: clientsWithAgentNames,
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
