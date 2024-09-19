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
  Typography,
} from "@mui/material";
import React from "react";
import { useVisitSidebar } from "../../hooks/useVisitSidebar";
import { Agent, Client } from "../../models/entityModels";

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
            <IconButton onClick={handleBackToAgents} size="small">
              {" "}
              {/* Makes the button smaller */}
              <ArrowBackIosIcon fontSize="small" />{" "}
              {/* Adjusts the icon size */}
            </IconButton>
          )}
          <Typography variant="h4">
            {userRole === "admin"
              ? selectedAgentId
                ? "Clients"
                : "Agents"
              : "Visits"}
          </Typography>
        </Box>
        {(userRole === "admin" || userRole === "agent") && (
          <Box display="flex" gap={1}>
            {/* Refresh Button */}
            <IconButton onClick={handleVisitsRefresh}>
              <RefreshIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Search Bar */}
      <TextField
        variant="outlined"
        placeholder={`Search ${
          userRole === "admin" && !selectedAgentId ? "Agents" : "Clients"
        }`}
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        type="search" // Ensures minimal autofill interference
        autoComplete="off" // Prevents autofill suggestions
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
            borderRadius: "25px", // Ensure the input itself has rounded corners
          },
        }}
      />

      {/* List */}
      <List>
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
                onClick={() =>
                  userRole === "admin" && !selectedAgentId
                    ? handleAgentSelect(item.id)
                    : handleClientSelect(item.id)
                }
                sx={{ display: "flex", alignItems: "center" }} // Ensures alignment within the list item
              >
                <ListItemAvatar>
                  <Avatar>{item.name.charAt(0).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={item.name}
                  secondary={
                    isAgent(item)
                      ? `ID: ${item.id}`
                      : isClient(item)
                      ? `Code: ${item.id} | Province: ${item.province || "N/A"}`
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
                      )}
                    {isAgent(item) &&
                      (
                        counts as {
                          hasPending: boolean;
                          hasIncomplete: boolean;
                        }
                      ).hasIncomplete && (
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
                      )}

                    {/* Client: Check for pendingCount and incompleteCount */}
                    {isClient(item) &&
                      (
                        counts as {
                          pendingCount: number;
                          incompleteCount: number;
                        }
                      ).pendingCount > 0 && (
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
                      )}
                    {isClient(item) &&
                      (
                        counts as {
                          pendingCount: number;
                          incompleteCount: number;
                        }
                      ).incompleteCount > 0 && (
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
                      )}
                  </Box>
                )}
              </ListItem>
              {index < filteredList.length - 1 && (
                <Divider key={`divider-${item.id}`} />
              )}
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );
};

export default VisitsSidebar;
