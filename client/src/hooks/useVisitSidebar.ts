// useVisitSidebar.ts
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { Agent, Client } from "../models/entityModels";
import { selectAgent, selectClient, updateVisits } from "../features/data/dataSlice";

export const useVisitSidebar = () => {
  const dispatch = useAppDispatch();
  const clients = useAppSelector((state) => state.data.clients);
  const agents = useAppSelector((state) => state.data.agents);
  const currentUser = useAppSelector((state) => state.data.currentUserDetails);
  const userRole = currentUser?.role;

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredList, setFilteredList] = useState<Client[] | Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  useEffect(() => {
    let list: Client[] | Agent[] = [];
    const term = searchTerm.toLowerCase();

    if (userRole === "admin") {
      if (selectedAgentId) {
        const agent = agents[selectedAgentId];
        list = agent.clients.filter(
          (client) =>
            client.name.toLowerCase().includes(term) ||
            client.id.toLowerCase().includes(term) ||
            (client.province && client.province.toLowerCase().includes(term))
        );
      } else {
        list = Object.values(agents).filter(
          (agent) =>
            agent.name.toLowerCase().includes(term) || agent.id.toLowerCase().includes(term)
        );
      }
    } else if (userRole === "agent") {
      list = Object.values(clients).filter(
        (client) =>
          client.name.toLowerCase().includes(term) ||
          client.id.toLowerCase().includes(term) ||
          (client.province && client.province.toLowerCase().includes(term))
      );
    }

    setFilteredList(list);
  }, [searchTerm, clients, agents, userRole, selectedAgentId]);

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgentId(agentId);
    dispatch(selectAgent(agentId));
  };

  const handleClientSelect = (clientId: string) => {
    dispatch(selectClient(clientId));
  };

  const handleBackToAgents = () => {
    setSelectedAgentId(null);
  };

  const handleCreateVisit = () => {
  };

  // New function to handle refreshing visits
  const handleVisitsRefresh = async () => {
    try {
      await dispatch(updateVisits());
    } catch (error) {
      console.error("Failed to refresh visits:", error);
    }
  };

  return {
    userRole,
    searchTerm,
    filteredList,
    selectedAgentId,
    handleAgentSelect,
    handleClientSelect,
    handleBackToAgents,
    handleCreateVisit,
    setSearchTerm,
    handleVisitsRefresh,
  };
};
