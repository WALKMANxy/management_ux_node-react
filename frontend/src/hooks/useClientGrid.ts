import { useCallback, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { Client } from "../models/models";
import { useGetClientsQuery } from "../services/api";

export const useClientsGrid = () => {
  const { data: clients = [] } = useGetClientsQuery();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientListCollapsed, setClientListCollapsed] = useState(false);
  const [isClientDetailsCollapsed, setClientDetailsCollapsed] = useState(false);
  const userRole = useSelector((state: RootState) => state.auth.userRole);
  const userId = useSelector((state: RootState) => state.auth.id);
  const [quickFilterText, setQuickFilterText] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const gridRef = useRef<any>(null);
  const clientDetailsRef = useRef<HTMLDivElement>(null); // Add ref for client details
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

  const handleClientSelect = useCallback(
    (clientId: string) => {
      const client = clients.find((client) => client.id === clientId) || null;
      setSelectedClient(client);
      if (clientDetailsRef.current) {
        clientDetailsRef.current.scrollIntoView({ behavior: "smooth" });
      }
    },
    [clients]
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
    return filtered;
  }, [clients, userRole, userId, startDate, endDate]);

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
    clientDetailsRef, // Export the client details ref
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
