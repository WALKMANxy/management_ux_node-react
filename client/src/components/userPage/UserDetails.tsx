// src/components/UserPage/UserDetails.tsx

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import InfoIcon from "@mui/icons-material/Info"; // Import InfoIcon from MUI
import SaveIcon from "@mui/icons-material/Save";
import { LoadingButton } from "@mui/lab";
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import "animate.css"; // Import Animate.css for animations
import React from "react";
import useUserDetails from "../../hooks/useUserDetails";
import { User } from "../../models/entityModels";
import UserCard from "./UserCard";

interface UserDetailsProps {
  user: Partial<User>;
  onBack: () => void;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user, onBack }) => {
  const {
    role,
    setRole,
    entityOptions,
    entitySearchText,
    handleEntitySearch,
    loadingEntities,
    loading,
    handleSaveChanges,
    selectedEntity,
    setSelectedEntity,
    ref,
    visibleRows,
    alertMessage,
    setAlertMessage,
    alertSeverity,
  } = useUserDetails(user);

  return (
    <Box>
      <Button onClick={onBack} sx={{ mb: 2, color: "black" }}>
        <ArrowBackIosIcon />
      </Button>

      {/* Current User Details Card */}
      <Box className="animate__animated animate__bounceIn">
        <UserCard
          email={user.email || "N/A"}
          avatar={user.avatar}
          details={{
            role: user.role,
            code: user.entityCode,
            name: user.entityName,
          }}
        />
      </Box>

      {/* Info message for selecting a new role */}
      <Box display="flex" alignItems="center" sx={{ mb: 2, mt: 2 }}>
        <InfoIcon color="info" sx={{ mr: 1, fontSize: "1.2rem" }} />
        <Typography variant="subtitle1" sx={{ color: "gray" }}>
          Select a new role.
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box display="flex" flexDirection="column" gap={2}>
        {/* Role Selection Buttons */}
        <ButtonGroup
          variant="contained"
          aria-label="Role selection"
          sx={{
            boxShadow: "none",
            gap: 1,
          }}
        >
          <Button
            onClick={() => setRole("client")}
            style={{
              backgroundColor: role === "client" ? "green" : "black",
              color: "white",
            }}
          >
            Client
          </Button>
          <Button
            onClick={() => setRole("agent")}
            style={{
              backgroundColor: role === "agent" ? "blue" : "black",
              color: "white",
            }}
          >
            Agent
          </Button>
          <Button
            onClick={() => setRole("admin")}
            style={{
              backgroundColor: role === "admin" ? "purple" : "black",
              color: "white",
            }}
          >
            Admin
          </Button>
        </ButtonGroup>

        {/* Info message for selecting an entity */}
        <Box display="flex" alignItems="center" sx={{ mb: 2, mt: 2 }}>
          <InfoIcon color="info" sx={{ mr: 1, fontSize: "1.2rem" }} />
          <Typography variant="subtitle1" sx={{ color: "gray" }}>
            Select an entity by double-clicking them.
          </Typography>
        </Box>

        <TextField
          label={`Search ${role}s by name or ID`}
          value={entitySearchText}
          onChange={(e) => handleEntitySearch(e.target.value)}
          variant="outlined"
          disabled={loadingEntities}
          helperText={
            loadingEntities ? "Loading entities..." : "Start typing to search"
          }
        />

        {loadingEntities && <CircularProgress />}

        {/* Table for displaying entities */}
        {!loadingEntities && (
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entityOptions.slice(0, visibleRows).map((entity) => (
                  <TableRow
                    hover
                    key={entity.id}
                    onClick={() => setSelectedEntity(entity)}
                    selected={selectedEntity?.id === entity.id}
                    sx={{
                      cursor: "pointer",
                      backgroundColor:
                        selectedEntity?.id === entity.id
                          ? "rgba(0, 0, 0, 0.08)"
                          : "inherit",
                    }}
                  >
                    <TableCell>{entity.name}</TableCell>
                    <TableCell>{entity.id}</TableCell>
                  </TableRow>
                ))}
                <TableRow ref={ref} />
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Divider sx={{ mb: 2 }} />

        {/* Confirmation Card below the table */}
        {selectedEntity && (
          <Box className="animate__animated animate__bounceIn">
            <UserCard
              email={user.email || "N/A"}
              avatar={user.avatar || "/default-avatar.png"}
              details={{
                role: role,
                code: selectedEntity.id,
                name: selectedEntity.name,
              }}
              isNew={true} // Apply faint green styling for new entity details
            />
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        <LoadingButton
          color="secondary"
          onClick={handleSaveChanges}
          loading={loading}
          loadingPosition="start"
          startIcon={<SaveIcon />}
          variant="contained"
        >
          Save
        </LoadingButton>

        {/* Alert for success or error message */}
        {alertMessage && (
          <Stack sx={{ width: "100%", mt: 2 }}>
            <Alert
              severity={alertSeverity}
              onClose={() => setAlertMessage(null)}
            >
              {alertMessage}
            </Alert>
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default UserDetails;
