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

const useManageEntities = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const clients = useAppSelector((state) => state.data.clients);
  const agents = useAppSelector((state) => state.data.agents);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [role, setRole] = useState<UserRole>("client");
  const [entitySearchText, setEntitySearchText] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<
    Client | Agent | Admin | Employee | null
  >(null);
  const [loadingEntities, setLoadingEntities] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.1 });
  const [visibleRows, setVisibleRows] = useState(20);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<AlertSeverity>();

  /**
   * Fetch admins and employees from APIs.
   */
  const fetchEntities = useCallback(async () => {
    setLoadingEntities(true);

    try {
      const [adminData, employeeData] = await Promise.all([
        loadAdminDetailsData(),
        getAllEmployees(),
      ]);
      setAdmins(adminData);
      setEmployees(employeeData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast.error(
          `${t("userDetails.loadAdminsError", "Failed to load admins")}: ${
            error.message
          }`
        );
        console.error("Error fetching admin or employee data:", error);
      } else {
        showToast.error(
          t("userDetails.loadAdminsError", "Failed to load admins")
        );
        console.error("Unknown error fetching admin or employee data:", error);
      }
    } finally {
      setLoadingEntities(false);
    }
  }, [t]);

  /**
   * Fetch admins and employees when the hook mounts.
   */
  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

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
        .map((client) => ({
          ...client,
          colour: client.colour || "",
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
    setVisibleRows(20);
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

        // Refetch entities to reflect changes
        await fetchEntities();
      } catch (error: unknown) {
        let errorMessage = "An unknown error occurred";

        if (error instanceof Error) {
          errorMessage = error.message;
        }

        showToast.error(
          `${t(
            "manageEntities.deleteFailed",
            "Failed to delete entity"
          )}: ${errorMessage}`
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
    [dispatch, role, t, fetchEntities]
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

        // Refetch entities to reflect changes
        await fetchEntities();
      } catch (error: unknown) {
        let errorMessage = "An unknown error occurred";

        if (error instanceof Error) {
          errorMessage = error.message;
        }

        showToast.error(
          `${t(
            "manageEntities.createFailed",
            "Failed to create entity"
          )}: ${errorMessage}`
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
    [dispatch, role, t, fetchEntities]
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

        // Refetch entities to reflect changes
        await fetchEntities();
      } catch (error: unknown) {
        let errorMessage = "An unknown error occurred";

        if (error instanceof Error) {
          errorMessage = error.message;
        }

        showToast.error(
          `${t(
            "manageEntities.updateFailed",
            "Failed to update entity"
          )}: ${errorMessage}`
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
    [dispatch, role, t, fetchEntities]
  );

  return {
    role,
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
    sortedClients,
  };
};

export default useManageEntities;
