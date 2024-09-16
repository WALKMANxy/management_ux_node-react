// VisitsSidebar.tsx
import AirplaneTicketIcon from "@mui/icons-material/AirplaneTicket";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh"; // New import
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
    handleCreateVisit,
    setSearchTerm,
    handleVisitsRefresh,
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
            <IconButton onClick={handleBackToAgents} size="small"> {/* Makes the button smaller */}
            <ArrowBackIosIcon fontSize="small" /> {/* Adjusts the icon size */}
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
            {/* Create Visit Button */}
            <IconButton onClick={handleCreateVisit}>
              <AirplaneTicketIcon />
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
        {filteredList.map((item, index) => (
          <>
            <ListItem
              key={item.id}
              button
              onClick={() =>
                userRole === "admin" && !selectedAgentId
                  ? handleAgentSelect(item.id)
                  : handleClientSelect(item.id)
              }
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
            </ListItem>
            {index < filteredList.length - 1 && <Divider />}
          </>
        ))}
      </List>
    </Box>
  );
};

export default VisitsSidebar;
