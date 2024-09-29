// src/components/UserPage/UserDetails.tsx

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import InfoIcon from "@mui/icons-material/Info";
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
  Tooltip,
  Typography,
} from "@mui/material";
import "animate.css";
import React from "react";
import { useTranslation } from "react-i18next";
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

  const { t } = useTranslation();

  return (
    <Box>
      <Tooltip title={t("userDetails.goBack", "Go back")} placement="top">
        <Button onClick={onBack} sx={{ mb: 2, color: "black" }}>
          <ArrowBackIosIcon />
        </Button>
      </Tooltip>

      {/* Current User Details Card */}
      <Box className="animate__animated animate__fadeInLeft">
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
      <Box display="flex" alignItems="center" sx={{ my: 3 }}>
        <InfoIcon color="info" sx={{ mr: 1, fontSize: "1.2rem" }} />
        <Typography variant="subtitle1" sx={{ color: "gray" }}>
          {t("userDetails.selectRole", "Select a new role.")}
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box display="flex" flexDirection="column" gap={1}>
        {/* Role Selection Buttons */}
        <ButtonGroup
          variant="contained"
          aria-label={t("userDetails.roleSelection", "Role selection")}
          sx={{
            boxShadow: "none",
            gap: 2,
          }}
        >
          <Tooltip
            title={t("userDetails.selectClient", "Select Client role")}
            placement="top"
          >
            <Button
              onClick={() => setRole("client")}
              sx={{
                backgroundColor: role === "client" ? "green" : "black",
                color: "white",
              }}
            >
              {t("userDetails.client", "Client")}
            </Button>
          </Tooltip>

          <Tooltip
            title={t("userDetails.selectAgent", "Select Agent role")}
            placement="top"
          >
            <Button
              onClick={() => setRole("agent")}
              sx={{
                backgroundColor: role === "agent" ? "blue" : "black",
                color: "white",
              }}
            >
              {t("userDetails.agent", "Agent")}
            </Button>
          </Tooltip>

          <Tooltip
            title={t("userDetails.selectAdmin", "Select Admin role")}
            placement="top"
          >
            <Button
              onClick={() => setRole("admin")}
              sx={{
                backgroundColor: role === "admin" ? "purple" : "black",
                color: "white",
              }}
            >
              {t("userDetails.admin", "Admin")}
            </Button>
          </Tooltip>
        </ButtonGroup>

        {/* Info message for selecting an entity */}
        <Box display="flex" alignItems="center" sx={{ my: 3 }}>
          <InfoIcon color="info" sx={{ mr: 1, fontSize: "1.2rem" }} />
          <Typography variant="subtitle1" sx={{ color: "gray" }}>
            {t(
              "userDetails.selectEntity",
              "Select an entity by double-clicking them."
            )}
          </Typography>
        </Box>

        <TextField
          label={t(
            "userDetails.searchPlaceholder",
            `Search ${role}s by name or ID`
          )}
          value={entitySearchText}
          onChange={(e) => handleEntitySearch(e.target.value)}
          variant="outlined"
          disabled={loadingEntities}
          helperText={
            loadingEntities
              ? t("userDetails.loadingEntities", "Loading entities...")
              : t("userDetails.startTyping", "Start typing to search")
          }
          sx={{ mb: 2 }}
        />

        {loadingEntities && <CircularProgress />}

        {/* Table for displaying entities */}
        {!loadingEntities && (
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>{t("userDetails.entityName", "Name")}</TableCell>
                  <TableCell>{t("userDetails.entityId", "ID")}</TableCell>
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
              isnew={"true"} // Apply faint green styling for new entity details
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
          {t("userDetails.saveChanges", "Save")}
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
