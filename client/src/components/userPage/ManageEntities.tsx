// src/components/userPage/ManageEntities.tsx

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useManageEntities from "../../hooks/useManageEntities";
import { Admin, Agent, Client, Employee } from "../../models/entityModels";
import { showToast } from "../../services/toastMessage";
import EntityDetails from "./EntityCard"; // Assuming EntityCard is the detailed view component
import EntityFormModal from "./EntityFormModal";

const ManageEntities: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [filter, setFilter] = useState<
    "client" | "agent" | "admin" | "employee"
  >("client");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    setRole,
    entityOptions,
    entitySearchText,
    handleEntitySearch,
    loadingEntities,
    loadingAction,
    selectedEntity,
    setSelectedEntity,
    ref,
    visibleRows,
    alertMessage,
    setAlertMessage,
    alertSeverity,
    handleDeleteEntity,
  } = useManageEntities();

  useEffect(() => {
    // Update role based on filter selection
    setRole(filter);
    setSelectedEntity(null); // Reset selected entity on filter change
  }, [filter, setRole, setSelectedEntity]);

  // Handle adding a new entity
  const handleAddButtonClick = () => {
    setIsEditing(false);
    setAddEditModalOpen(true);
  };

  // Handle editing an entity
  const handleEditButtonClick = (entity: Client | Agent | Admin | Employee) => {
    setSelectedEntity(entity);
    setIsEditing(true);
    setAddEditModalOpen(true);
  };

  // Handle deleting an entity
  const handleDeleteButtonClick = (
    entity: Client | Agent | Admin | Employee
  ) => {
    setSelectedEntity(entity);
    setDeleteDialogOpen(true);
  };

  // Confirm deletion of entity
  // Confirm deletion of entity
  const confirmDeleteEntity = () => {
    if (selectedEntity) {
      // Check if selectedEntity is of type Client and return early if true
      if ("totalNetRevenue" in selectedEntity) {
        // Assuming 'Client' has a 'CODICE' field, which is unique to Client
        console.error("Cannot delete Client entities");
        return;
      }

      handleDeleteEntity(selectedEntity);
      setDeleteDialogOpen(false);
      setSelectedEntity(null);
    } else {
      // Show error if no entity selected
      console.error("No entity selected for deletion");
    }
  };

  return (
    <Box sx={{ padding: isMobile ? 1 : 2 }}>
      <Typography variant="h4" gutterBottom>
        {t("manageEntities.title", "Manage Entities")}
      </Typography>

      {/* Display Alert Messages */}
      {alertMessage && (
        <Alert
          severity={alertSeverity}
          onClose={() => setAlertMessage(null)}
          sx={{ mb: 2 }}
        >
          {alertMessage}
        </Alert>
      )}

      {/* Information Tooltip */}
      <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
        <Tooltip
          title={t(
            "manageEntities.infoTooltip",
            "Use the filters to view different entity types. You can add, edit, or delete entities."
          )}
          arrow
        >
          <InfoIcon color="info" sx={{ mr: 1, fontSize: "1.2rem" }} />
        </Tooltip>
        <Typography variant="subtitle1">
          {t(
            "manageEntities.selectEntityPrompt",
            "Select an entity to view details."
          )}
        </Typography>
      </Box>

      {/* Role Selection Buttons (Client, Agent, Admin, Employee) */}
      <ButtonGroup
        variant="contained"
        aria-label={t("manageEntities.roleSelection", "Role selection")}
        sx={{ mb: 2 }}
      >
        <Button
          onClick={() => setFilter("client")}
          sx={{
            backgroundColor: filter === "client" ? "green" : "black",
            "&:hover": {
              backgroundColor: filter === "client" ? "darkgreen" : "gray",
            },
          }}
        >
          {t("manageEntities.client", "Client")}
        </Button>
        <Button
          onClick={() => setFilter("agent")}
          sx={{
            backgroundColor: filter === "agent" ? "blue" : "black",
            "&:hover": {
              backgroundColor: filter === "agent" ? "darkblue" : "gray",
            },
          }}
        >
          {t("manageEntities.agent", "Agent")}
        </Button>
        <Button
          onClick={() => setFilter("admin")}
          sx={{
            backgroundColor: filter === "admin" ? "purple" : "black",
            "&:hover": {
              backgroundColor: filter === "admin" ? "darkpurple" : "gray",
            },
          }}
        >
          {t("manageEntities.admin", "Admin")}
        </Button>
        <Button
          onClick={() => setFilter("employee")}
          sx={{
            backgroundColor: filter === "employee" ? "orange" : "black",
            "&:hover": {
              backgroundColor: filter === "employee" ? "darkorange" : "gray",
            },
          }}
        >
          {t("manageEntities.employee", "Employee")}
        </Button>
      </ButtonGroup>

      {/* Search Field */}
      <TextField
        label={t(
          "manageEntities.searchPlaceholder",
          `Search ${filter}s by name or ID`
        )}
        value={entitySearchText}
        onChange={(e) => handleEntitySearch(e.target.value)}
        variant="outlined"
        disabled={loadingEntities}
        helperText={
          loadingEntities
            ? t("manageEntities.loadingEntities", "Loading entities...")
            : t("manageEntities.startTyping", "Start typing to search")
        }
        fullWidth
        sx={{ mb: 2 }}
      />

      {/* Add Button */}
      <Box display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
        <IconButton onClick={handleAddButtonClick} color="primary">
          <AddIcon />
        </IconButton>
      </Box>

      {/* Table for displaying entities */}
      <TableContainer sx={{ maxHeight: 500 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>{t("manageEntities.entityName", "Name")}</TableCell>
              <TableCell>{t("manageEntities.entityId", "ID")}</TableCell>
              <TableCell>{t("manageEntities.actions", "Actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingEntities
              ? Array.from({ length: visibleRows }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={3}>
                      {t("manageEntities.loading", "Loading...")}
                    </TableCell>
                  </TableRow>
                ))
              : entityOptions.map((entity) => (
                  <TableRow
                    key={entity.id}
                    hover
                    onClick={() => setSelectedEntity(entity)}
                    selected={selectedEntity?.id === entity.id}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>{entity.name}</TableCell>
                    <TableCell>{entity.id}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditButtonClick(entity)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteButtonClick(entity)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            {/* Sentinel row for infinite scrolling */}
            <TableRow ref={ref}>
              <TableCell colSpan={3} />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Entity Details */}
      {selectedEntity && (
        <EntityDetails entity={selectedEntity} entityType={filter} />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          {t("manageEntities.confirmDelete", "Confirm Deletion")}
        </DialogTitle>
        <DialogContent>
          {t(
            "manageEntities.deleteWarning",
            "Are you sure you want to delete this entity? This action is irreversible. Please make sure to update any related data."
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={confirmDeleteEntity}
            color="error"
            disabled={loadingAction}
          >
            {t("manageEntities.deleteButton", "Delete")}
          </Button>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={loadingAction}
          >
            {t("manageEntities.cancelButton", "Cancel")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Modal */}
      <EntityFormModal
        open={addEditModalOpen}
        onClose={() => setAddEditModalOpen(false)}
        isEditing={isEditing}
        entityType={filter}
        entity={isEditing ? selectedEntity : null}
        onSave={() => {
          setAddEditModalOpen(false);
          // Optionally, refetch or update entities after save
          showToast.success(
            isEditing
              ? t("manageEntities.editSuccess", "Entity updated successfully")
              : t("manageEntities.addSuccess", "Entity added successfully")
          );
        }}
      />
    </Box>
  );
};

export default ManageEntities;
