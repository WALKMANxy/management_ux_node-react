// useVisitSidebar.ts
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectVisits } from "../features/data/dataSelectors";
import { selectAgent, selectClient } from "../features/data/dataSlice";
import { getVisits } from "../features/data/dataThunks";
import { Agent, Client } from "../models/entityModels";

export const useVisitSidebar = () => {
  const dispatch = useAppDispatch();
  const clients = useAppSelector((state) => state.data.clients);
  const agents = useAppSelector((state) => state.data.agents);
  const currentUser = useAppSelector((state) => state.data.currentUserDetails);
  const userRole = currentUser?.role;

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredList, setFilteredList] = useState<Client[] | Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const visits = useAppSelector(selectVisits);

  const selectedClientId = useAppSelector(
    (state) => state.data.selectedClientId
  );

  // For agent counts
  const agentVisitCounts = useMemo(() => {
    const counts: Record<
      string,
      { hasPending: boolean; hasIncomplete: boolean }
    > = {};

    visits.forEach((visit) => {
      const agentId = visit.agentId || "unknown";

      if (!counts[agentId]) {
        counts[agentId] = { hasPending: false, hasIncomplete: false };
      }

      if (visit.pending === true) {
        counts[agentId].hasPending = true;
      }

      if (visit.pending === false && visit.completed === false) {
        counts[agentId].hasIncomplete = true;
      }
    });

    return counts;
  }, [visits]);

  // For client counts
  const clientVisitCounts = useMemo(() => {
    const counts: Record<
      string,
      { pendingCount: number; incompleteCount: number }
    > = {};

    visits.forEach((visit) => {
      const clientId = visit.clientId;

      if (!counts[clientId]) {
        counts[clientId] = { pendingCount: 0, incompleteCount: 0 };
      }

      if (visit.pending === true) {
        counts[clientId].pendingCount += 1;
      }

      if (visit.pending === false && visit.completed === false) {
        counts[clientId].incompleteCount += 1;
      }
    });

    return counts;
  }, [visits]);

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
            agent.name.toLowerCase().includes(term) ||
            agent.id.toLowerCase().includes(term)
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

  const handleCreateVisit = () => {};

  // New function to handle refreshing visits
  const handleVisitsRefresh = async () => {
    try {
      await dispatch(getVisits());
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
    agentVisitCounts,
    clientVisitCounts,
    selectedClientId,
  };
};
