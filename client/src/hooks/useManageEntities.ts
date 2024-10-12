// src/hooks/useManageEntities.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { loadAdminDetailsData } from "../features/data/api/admins";
import { getAllEmployees } from "../features/data/api/employees";
import {
  createAdminAsync,
  createAgentAsync,
  createEmployeeAsync,
  deleteAdminAsync,
  deleteAgentAsync,
  deleteEmployeeAsync,
  updateAdminAsync,
  updateAgentAsync,
  updateEmployeeAsync,
} from "../features/data/entityThunks";
import {
  Admin,
  Agent,
  Client,
  Employee,
  UserRole,
} from "../models/entityModels";
import { showToast } from "../services/toastMessage";

type AlertSeverity = "success" | "error";

/**
 * Custom hook for managing entities (Agent, Admin, Employee).
 * Create and update actions are excluded for Clients.
 */
const useManageEntities = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // Access clients and agents from the Redux store
  const clients = useAppSelector((state) => state.data.clients);
  const agents = useAppSelector((state) => state.data.agents);

  // Local state for admins and employees fetched from APIs
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Current role filter (default to "client")
  const [role, setRole] = useState<UserRole>("client");

  // Search text for filtering entities
  const [entitySearchText, setEntitySearchText] = useState("");

  // Selected entity for viewing details or performing actions
  const [selectedEntity, setSelectedEntity] = useState<
    Client | Agent | Admin | Employee | null
  >(null);

  // Loading states
  const [loadingEntities, setLoadingEntities] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  // Infinite scroll setup
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.1 });
  const [visibleRows, setVisibleRows] = useState(20);

  // Alert message state
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<AlertSeverity>();

  /**
   * Fetch admins and employees when the hook mounts.
   */
  useEffect(() => {
    setLoadingEntities(true);

    // Load both admins and employees in parallel
    Promise.all([loadAdminDetailsData(), getAllEmployees()])
      .then(([adminData, employeeData]) => {
        setAdmins(adminData); // Store fetched admins
        setEmployees(employeeData); // Store fetched employees
        setLoadingEntities(false);
      })
      .catch((error: Error) => {
        showToast.error(
          t("userDetails.loadAdminsError") + ": " + error.message
        );
        console.error("Error fetching admin or employee data:", error);
        setLoadingEntities(false);
      });
  }, [t]);

  /**
   * Sorted lists for each entity type.
   */
  const sortedAdmins = useMemo(
    () => [...admins].sort((a, b) => a.name.localeCompare(b.name)),
    [admins]
  );

  const sortedEmployees = useMemo(
    () => [...employees].sort((a, b) => a.name.localeCompare(b.name)),
    [employees]
  );

  const sortedClients = useMemo(
    () =>
      Object.values(clients)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(client => ({
          ...client,
          colour: client.colour || "", // Initialize colour if not present
        })),
    [clients]
  );

  const sortedAgents = useMemo(
    () => Object.values(agents).sort((a, b) => a.name.localeCompare(b.name)),
    [agents]
  );

  /**
   * Base entity options based on the selected role.
   */
  const baseEntityOptions = useMemo(() => {
    switch (role) {
      case "admin":
        return sortedAdmins;
      case "client":
        return sortedClients;
      case "agent":
        return sortedAgents;
      case "employee":
        return sortedEmployees;
      default:
        return [];
    }
  }, [role, sortedAdmins, sortedClients, sortedAgents, sortedEmployees]);

  /**
   * Filter entities based on the search text.
   */
  const filteredEntityOptions = useMemo(() => {
    if (!entitySearchText.trim()) {
      return baseEntityOptions;
    }
    const searchLower = entitySearchText.toLowerCase();
    return baseEntityOptions.filter(
      (entity) =>
        entity.name.toLowerCase().includes(searchLower) ||
        entity.id.toLowerCase().includes(searchLower)
    );
  }, [baseEntityOptions, entitySearchText]);

  /**
   * Paginate the filtered entities for infinite scrolling.
   */
  const entityOptions = useMemo(() => {
    return filteredEntityOptions.slice(0, visibleRows);
  }, [filteredEntityOptions, visibleRows]);

  /**
   * Load more entities when the sentinel is in view.
   */
  useEffect(() => {
    if (inView && visibleRows < filteredEntityOptions.length) {
      setVisibleRows((prev) =>
        Math.min(prev + 20, filteredEntityOptions.length)
      );
    }
  }, [inView, filteredEntityOptions.length, visibleRows]);

  /**
   * Handle changes in the search input.
   */
  const handleEntitySearch = useCallback((searchText: string) => {
    setEntitySearchText(searchText);
    setVisibleRows(20); // Reset pagination on new search
  }, []);

  /**
   * Handle deletion of an entity based on its type.
   */
  const handleDeleteEntity = useCallback(
    async (entity: Agent | Admin | Employee | Client) => {
      if (!entity.id) {
        showToast.error(
          t("manageEntities.entityIdUndefined", "Entity ID is undefined")
        );
        console.error("Entity ID is undefined");
        return;
      }

      setLoadingAction(true);

      try {
        switch (role) {
          case "agent":
            await dispatch(deleteAgentAsync(entity.id)).unwrap();
            showToast.success(
              t(
                "manageEntities.deleteAgentSuccess",
                "Agent deleted successfully"
              )
            );
            break;
          case "admin":
            await dispatch(deleteAdminAsync(entity.id)).unwrap();
            showToast.success(
              t(
                "manageEntities.deleteAdminSuccess",
                "Admin deleted successfully"
              )
            );
            break;
          case "employee":
            await dispatch(deleteEmployeeAsync(entity.id)).unwrap();
            showToast.success(
              t(
                "manageEntities.deleteEmployeeSuccess",
                "Employee deleted successfully"
              )
            );
            break;
          default:
            throw new Error(
              t("manageEntities.unknownEntityType", "Unknown entity type")
            );
        }

        setAlertMessage(
          t("manageEntities.deleteSuccess", "Entity deleted successfully")
        );
        setAlertSeverity("success");
        setSelectedEntity(null);
      } catch (error: unknown) {
        let errorMessage = "An unknown error occurred";

        if (error instanceof Error) {
          errorMessage = error.message;
        }

        showToast.error(
          `${t("manageEntities.deleteFailed", "Failed to delete entity")}: ${errorMessage}`
        );

        setAlertMessage(
          t("manageEntities.deleteFailed", { message: errorMessage })
        );

        setAlertSeverity("error");
        console.error("Error deleting entity:", error);
      } finally {
        setLoadingAction(false);
      }
    },
    [dispatch, role, t]
  );

  /**
   * Handle creation of an entity based on its type.
   */
  const handleCreateEntity = useCallback(
    async (entityData: Partial<Agent | Admin | Employee>) => {
      setLoadingAction(true);

      try {
        switch (role) {
          case "agent": {
            await dispatch(createAgentAsync(entityData as Agent)).unwrap();
            showToast.success(
              t(
                "manageEntities.createAgentSuccess",
                "Agent created successfully"
              )
            );
            break;
          }
          case "admin": {
            await dispatch(createAdminAsync(entityData as Admin)).unwrap();
            showToast.success(
              t(
                "manageEntities.createAdminSuccess",
                "Admin created successfully"
              )
            );
            break;
          }
          case "employee": {
            await dispatch(
              createEmployeeAsync(entityData as Employee)
            ).unwrap();
            showToast.success(
              t(
                "manageEntities.createEmployeeSuccess",
                "Employee created successfully"
              )
            );
            break;
          }
          default:
            throw new Error(
              t("manageEntities.unknownEntityType", "Unknown entity type")
            );
        }

        setAlertMessage(
          t("manageEntities.createSuccess", "Entity created successfully")
        );
        setAlertSeverity("success");
      } catch (error: unknown) {
        let errorMessage = "An unknown error occurred";

        if (error instanceof Error) {
          errorMessage = error.message;
        }

        showToast.error(
          `${t("manageEntities.createFailed", "Failed to create entity")}: ${errorMessage}`
        );

        setAlertMessage(
          t("manageEntities.createFailed", { message: errorMessage })
        );

        setAlertSeverity("error");
        console.error("Error creating entity:", error);
      } finally {
        setLoadingAction(false);
      }
    },
    [dispatch, role, t]
  );

  /**
   * Handle updating of an entity based on its type.
   */
  const handleUpdateEntity = useCallback(
    async (id: string, updatedData: Partial<Agent | Admin | Employee>) => {
      setLoadingAction(true);

      try {
        switch (role) {
          case "agent": {
            await dispatch(updateAgentAsync({ id, updatedData })).unwrap();
            showToast.success(
              t(
                "manageEntities.updateAgentSuccess",
                "Agent updated successfully"
              )
            );
            break;
          }
          case "admin": {
            await dispatch(updateAdminAsync({ id, updatedData })).unwrap();
            showToast.success(
              t(
                "manageEntities.updateAdminSuccess",
                "Admin updated successfully"
              )
            );
            break;
          }
          case "employee": {
            await dispatch(updateEmployeeAsync({ id, updatedData })).unwrap();
            showToast.success(
              t(
                "manageEntities.updateEmployeeSuccess",
                "Employee updated successfully"
              )
            );
            break;
          }
          default:
            throw new Error(
              t("manageEntities.unknownEntityType", "Unknown entity type")
            );
        }

        setAlertMessage(
          t("manageEntities.updateSuccess", "Entity updated successfully")
        );
        setAlertSeverity("success");
        setSelectedEntity(null);
      } catch (error: unknown) {
        let errorMessage = "An unknown error occurred";

        if (error instanceof Error) {
          errorMessage = error.message;
        }

        showToast.error(
          `${t("manageEntities.updateFailed", "Failed to update entity")}: ${errorMessage}`
        );

        setAlertMessage(
          t("manageEntities.updateFailed", { message: errorMessage })
        );

        setAlertSeverity("error");
        console.error("Error updating entity:", error);
      } finally {
        setLoadingAction(false);
      }
    },
    [dispatch, role, t]
  );

  return {
    // State and setters
    role,
    setRole,
    entityOptions,
    entitySearchText,
    handleEntitySearch,
    loadingEntities,
    loadingAction,
    selectedEntity,
    setSelectedEntity,
    ref, // For infinite scrolling
    visibleRows,
    alertMessage,
    setAlertMessage,
    alertSeverity,
    // Action handlers
    handleDeleteEntity,
    handleCreateEntity,
    handleUpdateEntity,
    sortedClients,
  };
};

export default useManageEntities;
