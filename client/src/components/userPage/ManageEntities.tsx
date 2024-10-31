// src/components/userPage/ManageEntities.tsx
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import "animate.css";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../app/hooks";
import { selectCurrentUser } from "../../features/users/userSlice";
import useManageEntities from "../../hooks/useManageEntities";
import { Admin, Agent, Client, Employee } from "../../models/entityModels";
import { showToast } from "../../services/toastMessage";
import EntityDetails from "./EntityCard"; // Assuming EntityCard is the detailed view component
import EntityFormModal from "./EntityFormModal";

type Order = "asc" | "desc";

interface HeadCell {
  id: keyof Client | keyof Agent | keyof Admin | keyof Employee;
  label: string;
  numeric: boolean;
}

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
  borderRadius: "50%",
  width: 48,
  height: 48,
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: theme.palette.common.white,
  "&:hover": {
    backgroundColor: theme.palette.error.dark,
  },
  borderRadius: "50%",
  width: 48,
  height: 48,
}));

const ManageEntities: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const entityCode = useAppSelector(selectCurrentUser)?.entityCode;

  const [filter, setFilter] = useState<
    "client" | "agent" | "admin" | "employee"
  >("client");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Sorting state
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<"name" | "id">("name");

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
    handleCreateEntity,
    handleUpdateEntity,
  } = useManageEntities();

  const headCells: HeadCell[] = [
    {
      id: "name",
      label: t("manageEntities.nameLabel", "Name"),
      numeric: false,
    },
    {
      id: "id",
      label: "ID",
      numeric: true,
    },
  ];

  useEffect(() => {
    setRole(filter);
    setSelectedEntity(null);
    setOrder("asc");
    setOrderBy("name");
  }, [filter, setRole, setSelectedEntity]);

  const descendingComparator = useCallback(
    (
      a: Client | Agent | Admin | Employee,
      b: Client | Agent | Admin | Employee,
      orderBy: "name" | "id"
    ) => {
      if (orderBy === "name") {
        return b.name.localeCompare(a.name);
      } else {
        // Assuming IDs are numeric strings
        return parseInt(b.id, 10) - parseInt(a.id, 10);
      }
    },
    []
  );

  // Comparator function
  const getComparator = useCallback(
    (order: Order, orderBy: "name" | "id") =>
      order === "desc"
        ? (
            a: Client | Agent | Admin | Employee,
            b: Client | Agent | Admin | Employee
          ) => descendingComparator(a, b, orderBy)
        : (
            a: Client | Agent | Admin | Employee,
            b: Client | Agent | Admin | Employee
          ) => -descendingComparator(a, b, orderBy),
    [descendingComparator]
  );

  // Stable sort function
  const stableSort = (
    array: (Client | Agent | Admin | Employee)[],
    comparator: (
      a: Client | Agent | Admin | Employee,
      b: Client | Agent | Admin | Employee
    ) => number
  ) => {
    const stabilizedThis = array.map(
      (el, index) => [el, index] as [Client | Agent | Admin | Employee, number]
    );
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  // Handle sorting request
  const handleRequestSort = (property: "name" | "id") => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Memoized sorted entities
  const sortedEntities = useMemo(() => {
    return stableSort(entityOptions, getComparator(order, orderBy));
  }, [entityOptions, order, orderBy, getComparator]);

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
    if (filter === "admin" && entity.id === entityCode) {
      showToast.error(
        t(
          "manageEntities.cannotDeleteYourself",
          "You cannot delete your own entity."
        )
      );
      return;
    }

    setDeleteDialogOpen(true);
  };

  // Confirm deletion of entity
  const confirmDeleteEntity = () => {
    if (selectedEntity) {
      // Prevent deletion of Client entities by checking the current filter
      if (filter === "client") {
        showToast.error(
          t(
            "manageEntities.cannotDeleteClient",
            "Cannot delete Client entities."
          )
        );
        console.error("Cannot delete Client entities");
        setDeleteDialogOpen(false);
        return;
      }

      if (filter === "admin" && selectedEntity.id === entityCode) {
        showToast.error(
          t(
            "manageEntities.cannotDeleteYourself",
            "You cannot delete your own entity."
          )
        );
        console.error("You cannot delete your own entity");
        setDeleteDialogOpen(false);
        return;
      }

      handleDeleteEntity(selectedEntity);
      setDeleteDialogOpen(false);
      setSelectedEntity(null);
    } else {
      // Show error if no entity selected
      showToast.error(
        t("manageEntities.noEntitySelected", "No entity selected for deletion.")
      );
      console.error("No entity selected for deletion");
    }
  };

  return (
    <Box sx={{ px: 0, pb: 1 }}>
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
        sx={{
          boxShadow: "none",
          gap: 2,
          transform: isMobile ? "scale(0.75)" : "none",
          transformOrigin: "top left",
          width: isMobile ? "133.33%" : "100%",
          mb: 2.5,
        }}
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
        sx={{ mb: 0 }}
      />

      {/* Add Button */}
      <Box display="flex" justifyContent="flex-end" sx={{ mb: 0 }}>
        <IconButton
          onClick={handleAddButtonClick}
          color="primary"
          disabled={filter === "client"}
          title={
            filter === "client"
              ? t("manageEntities.addDisabled", "Adding Clients is disabled.")
              : t("manageEntities.addEntity", "Add Entity")
          }
        >
          <AddIcon />
        </IconButton>
      </Box>

      {/* Table for displaying entities */}
      <TableContainer sx={{ maxHeight: 500 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : "asc"}
                    onClick={() =>
                      handleRequestSort(headCell.id as "name" | "id")
                    }
                  >
                    {t(
                      `manageEntities.${headCell.label.toLowerCase()}`,
                      headCell.label
                    )}
                  </TableSortLabel>
                </TableCell>
              ))}
              {filter !== "client" && (
                <TableCell>{t("manageEntities.actions", "Actions")}</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingEntities ? (
              Array.from({ length: visibleRows }).map((_, index) => (
                <TableRow
                  key={index}
                  className="animate__animated animate__fadeOut"
                >
                  <TableCell>
                    <Skeleton variant="text" />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" />
                  </TableCell>
                </TableRow>
              ))
            ) : sortedEntities.length > 0 ? (
              sortedEntities.map((entity) => (
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
                  className="animate__animated animate__fadeIn"
                >
                  <TableCell>{entity.name}</TableCell>
                  <TableCell>{entity.id}</TableCell>
                  {filter !== "client" && (
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
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={filter !== "client" ? 3 : 2} align="center">
                  {t("manageEntities.noEntitiesFound", "No entities found.")}
                </TableCell>
              </TableRow>
            )}
            {/* Sentinel row for infinite scrolling */}
            <TableRow ref={ref}>
              <TableCell colSpan={filter !== "client" ? 3 : 2} />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Entity Details */}
      {selectedEntity && (
        <Box pt={2} className="animate__animated animate__bounceIn">
          <EntityDetails entity={selectedEntity} entityType={filter} />
        </Box>
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
          <Box
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
            }}
          >
            {/* Delete Button */}
            <Tooltip title={t("manageEntities.deleteTooltip", "Delete")} arrow>
              <StyledIconButton
                onClick={confirmDeleteEntity}
                color="error"
                aria-label={t("manageEntities.deleteButton", "Delete")}
                disabled={loadingAction || filter === "client"}
              >
                {loadingAction ? (
                  <CircularProgress size={24} />
                ) : (
                  <DeleteIcon />
                )}
              </StyledIconButton>
            </Tooltip>

            {/* Cancel Button */}
            <Tooltip title={t("manageEntities.cancelTooltip", "Cancel")} arrow>
              <StyledCloseButton
                onClick={() => setDeleteDialogOpen(false)}
                aria-label={t("manageEntities.cancelButton", "Cancel")}
                disabled={loadingAction}
              >
                <CloseIcon />
              </StyledCloseButton>
            </Tooltip>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Modal */}
      <EntityFormModal
        open={addEditModalOpen}
        onClose={() => setAddEditModalOpen(false)}
        isEditing={isEditing}
        entityType={filter}
        entity={
          isEditing ? (selectedEntity as Admin | Agent | Employee | null) : null
        }
        onSave={() => {
          setAddEditModalOpen(false);
        }}
        onCreate={handleCreateEntity}
        onUpdate={handleUpdateEntity}
      />
    </Box>
  );
};

export default ManageEntities;
