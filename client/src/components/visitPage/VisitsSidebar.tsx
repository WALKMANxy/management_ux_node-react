// VisitsSidebar.tsx
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ExclamationIcon from "@mui/icons-material/ErrorOutline"; // You can choose an appropriate icon
import RefreshIcon from "@mui/icons-material/Refresh"; // New import
import SearchIcon from "@mui/icons-material/Search";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useVisitSidebar } from "../../hooks/useVisitSidebar";
import { Agent, Client } from "../../models/entityModels";

const VisitsSidebar: React.FC = () => {
  const { t } = useTranslation();

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

  // Type Guards
  const isAgent = (item: Agent | Client): item is Agent => {
    return (item as Agent).clients !== undefined;
  };

  const isClient = (item: Agent | Client): item is Client => {
    return (
      (item as Client).province !== undefined ||
      (item as Client).name !== undefined
    );
  };

  // Handlers with useCallback to prevent unnecessary re-renders
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
      {/* Header with title and create button */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box display="flex" alignItems="center">
          {userRole === "admin" && selectedAgentId && (
            <Tooltip
              title={t("visitsSidebar.goBackTooltip", "Go back to Agents")}
              arrow
            >
              <IconButton
                onClick={handleBackToAgents}
                size="small"
                aria-label={t("visitsSidebar.goBack", "Go Back")}
              >
                <ArrowBackIosIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Typography variant="h5">
            {userRole === "admin"
              ? selectedAgentId
                ? t("visitsSidebar.clients", "Clients")
                : t("visitsSidebar.agents", "Agents")
              : t("visitsSidebar.visits", "Visits")}
          </Typography>
        </Box>
        {(userRole === "admin" || userRole === "agent") && (
          <Tooltip
            title={t("visitsSidebar.refreshTooltip", "Refresh Visits")}
            arrow
          >
            <IconButton
              onClick={handleVisitsRefresh}
              aria-label={t("visitsSidebar.refresh", "Refresh Visits")}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Search Bar */}
      <Tooltip title={t("visitsSidebar.searchTooltip", "Search")} arrow>
        <TextField
          variant="outlined"
          placeholder={
            userRole === "admin" && !selectedAgentId
              ? t("visitsSidebar.searchAgents", "Search Agents")
              : t("visitsSidebar.searchClients", "Search Clients")
          }
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          type="search"
          autoComplete="off"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: "25px",
            },
          }}
        />
      </Tooltip>

      {/* List */}
      <List sx={{ flexGrow: 1, overflowY: "auto" }}>
        {filteredList.map((item, index) => {
          const counts = isAgent(item)
            ? agentVisitCounts[item.id]
            : isClient(item)
            ? clientVisitCounts[item.id]
            : undefined;

          return (
            <React.Fragment key={item.id}>
              <ListItem
                button
                selected={isClient(item) && item.id === selectedClientId}
                onClick={() => handleListItemClick(item)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "12px",
                }}
              >
                <ListItemAvatar>
                  <Avatar>{item.name.charAt(0).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={item.name}
                  secondary={
                    isAgent(item)
                      ? `${t("visitsSidebar.id", "ID")}: ${item.id}`
                      : isClient(item)
                      ? `${t("visitsSidebar.code", "Code")}: ${item.id} | ${t(
                          "visitsSidebar.province",
                          "Province"
                        )}: ${item.province || t("visitsSidebar.na", "N/A")}`
                      : undefined
                  }
                />
                {/* Icons or counts */}
                {counts && (
                  <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="flex-end" // Aligns icons to the bottom
                    alignItems="center"
                    gap={1}
                    sx={{ height: "100%" }} // Ensure it takes the full height of the parent container
                  >
                    {/* Agent: Check for hasPending and hasIncomplete */}
                    {isAgent(item) &&
                      (
                        counts as {
                          hasPending: boolean;
                          hasIncomplete: boolean;
                        }
                      ).hasPending && (
                        <Tooltip
                          title={t(
                            "visitsSidebar.pendingVisits",
                            "Has Pending Visits"
                          )}
                          arrow
                        >
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              backgroundColor: "lightgreen",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <ExclamationIcon fontSize="small" />
                          </Box>
                        </Tooltip>
                      )}
                    {isAgent(item) &&
                      (
                        counts as {
                          hasPending: boolean;
                          hasIncomplete: boolean;
                        }
                      ).hasIncomplete && (
                        <Tooltip
                          title={t(
                            "visitsSidebar.incompleteVisits",
                            "Has Incomplete Visits"
                          )}
                          arrow
                        >
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              backgroundColor: "lightcoral",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <ExclamationIcon fontSize="small" />
                          </Box>
                        </Tooltip>
                      )}

                    {/* Client: Check for pendingCount and incompleteCount */}
                    {isClient(item) &&
                      (
                        counts as {
                          pendingCount: number;
                          incompleteCount: number;
                        }
                      ).pendingCount > 0 && (
                        <Tooltip
                          title={t(
                            "visitsSidebar.pendingCount",
                            "{{count}} Pending Visits",
                            {
                              count: (
                                counts as {
                                  pendingCount: number;
                                  incompleteCount: number;
                                }
                              ).pendingCount,
                            }
                          )}
                          arrow
                        >
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              backgroundColor: "lightgreen",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {
                              (
                                counts as {
                                  pendingCount: number;
                                  incompleteCount: number;
                                }
                              ).pendingCount
                            }
                          </Box>
                        </Tooltip>
                      )}
                    {isClient(item) &&
                      (
                        counts as {
                          pendingCount: number;
                          incompleteCount: number;
                        }
                      ).incompleteCount > 0 && (
                        <Tooltip
                          title={t(
                            "visitsSidebar.incompleteCount",
                            "{{count}} Incomplete Visits",
                            {
                              count: (
                                counts as {
                                  pendingCount: number;
                                  incompleteCount: number;
                                }
                              ).incompleteCount,
                            }
                          )}
                          arrow
                        >
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              backgroundColor: "lightcoral",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {
                              (
                                counts as {
                                  pendingCount: number;
                                  incompleteCount: number;
                                }
                              ).incompleteCount
                            }
                          </Box>
                        </Tooltip>
                      )}
                  </Box>
                )}
              </ListItem>
              {index < filteredList.length - 1 && (
                <Divider sx={{ my: 1 }} key={`divider-${item.id}`} />
              )}
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );
};

export default VisitsSidebar;
