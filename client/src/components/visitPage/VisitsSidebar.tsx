//src/components/visitPage/VisitsSidebar.tsx
import { Box, List, useTheme } from "@mui/material";
import React, { useCallback } from "react";
import { useVisitSidebar } from "../../hooks/useVisitSidebar";
import { Agent, Client } from "../../models/entityModels";
import HeaderSidebar from "./HeaderSidebar";
import SearchBarSidebar from "./SearchBarSidebar";
import SidebarList from "./SidebarList";

export interface AgentCounts {
  hasPending: boolean;
  hasIncomplete: boolean;
}

export interface ClientCounts {
  pendingCount: number;
  incompleteCount: number;
}

export type Counts = AgentCounts | ClientCounts;
const isAgent = (item: Agent | Client): item is Agent => {
  return (item as Agent).clients !== undefined;
};

const isClient = (item: Agent | Client): item is Client => {
  return (
    (item as Client).province !== undefined ||
    (item as Client).name !== undefined
  );
};

const VisitsSidebar: React.FC = () => {
  const {
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
  } = useVisitSidebar();

  const theme = useTheme();
  const isMobile = theme.breakpoints.down("sm");

  const handleListItemClick = useCallback(
    (item: Agent | Client) => {
      if (userRole === "admin" && !selectedAgentId) {
        handleAgentSelect(item.id);
      } else {
        handleClientSelect(item.id);
      }
    },
    [userRole, selectedAgentId, handleAgentSelect, handleClientSelect]
  );

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <HeaderSidebar
        userRole={userRole!}
        selectedAgentId={selectedAgentId}
        handleBackToAgents={handleBackToAgents}
        handleVisitsRefresh={handleVisitsRefresh}
      />

      {/* Search Bar */}
      <SearchBarSidebar
        userRole={userRole!}
        selectedAgentId={selectedAgentId}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* List */}
      <List
        sx={{
          height: isMobile ? "79vh" : "100dvh",
          overflowY: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": {
            display: "none", 
          },
        }}
      >
        {filteredList.map((item) => {
          const counts: Counts | undefined = isAgent(item)
            ? agentVisitCounts[item.id]
            : isClient(item)
            ? clientVisitCounts[item.id]
            : undefined;

          const isSelected = isClient(item) && item.id === selectedClientId;

          return (
            <SidebarList
              key={`${isAgent(item) ? "agent" : "client"}-${item.id}`}
              item={item}
              counts={counts}
              isSelected={isSelected}
              onClick={() => handleListItemClick(item)}
            />
          );
        })}
      </List>
    </Box>
  );
};

export default VisitsSidebar;
