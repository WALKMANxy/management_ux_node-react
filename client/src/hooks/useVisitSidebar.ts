// useVisitSidebar.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectAgent, selectClient } from "../features/data/dataSlice";
import { getVisits } from "../features/data/dataThunks";
import { selectVisits } from "../features/promoVisits/promoVisitsSelectors";
import { Agent, Client } from "../models/entityModels";
import { showToast } from "../services/toastMessage";

export const useVisitSidebar = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

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
    // Set up debounce timeout
    const handler = setTimeout(() => {
      let list: Client[] | Agent[] = [];
      const term = searchTerm.toLowerCase();

      if (userRole === "admin") {
        if (selectedAgentId) {
          const agent = agents[selectedAgentId];
          list = agent.clients.filter(
            (client: Client) =>
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
    }, ); // 300ms debounce delay

    // Cleanup function to clear the timeout if the user continues typing
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, clients, agents, userRole, selectedAgentId, setFilteredList]);

  const handleAgentSelect = useCallback(
    (agentId: string) => {
      setSelectedAgentId(agentId);
      dispatch(selectAgent(agentId));
    },
    [dispatch, setSelectedAgentId]
  );

  const handleClientSelect = useCallback(
    (clientId: string) => {
      dispatch(selectClient(clientId));
    },
    [dispatch]
  );

  const handleBackToAgents = useCallback(() => {
    setSelectedAgentId(null);
  }, [setSelectedAgentId]);

  // New function to handle refreshing visits
  const handleVisitsRefresh = async () => {
    try {
      await dispatch(getVisits()).unwrap();
      showToast.success(t("useVisits.visitsRefreshed"));
    } catch (error) {
      console.error(t("useVisits.failedToRefreshVisits"), error);
      showToast.error(t("useVisits.failedToRefreshVisits"));
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
    setSearchTerm,
    handleVisitsRefresh,
    agentVisitCounts,
    clientVisitCounts,
    selectedClientId,
  };
};
