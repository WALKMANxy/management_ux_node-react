// src/hooks/useUserDetails.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { loadAdminDetailsData } from "../features/data/api/admins";
import { getAllEmployees } from "../features/data/api/employees";
import {
  deleteUserByIdThunk,
  updateUserById,
} from "../features/users/userSlice";
import {
  Admin,
  Agent,
  Client,
  Employee,
  User,
  UserRole,
} from "../models/entityModels";
import { showToast } from "../services/toastMessage";

const useUserDetails = (user: Partial<User>) => {
  const clients = useAppSelector((state) => state.data.clients);
  const agents = useAppSelector((state) => state.data.agents);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [role, setRole] = useState<UserRole>(user.role || "guest");
  const [entitySearchText, setEntitySearchText] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<
    Client | Agent | Admin | Employee | null
  >(null);
  const [loadingEntities, setLoadingEntities] = useState(false);
  const [loading, setLoading] = useState(false);
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.1 });
  const [visibleRows, setVisibleRows] = useState(20);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">();

  // Fetch admins only once when the component mounts
  useEffect(() => {
    setLoadingEntities(true);

    // Load both admins and employees in parallel
    Promise.all([loadAdminDetailsData(), getAllEmployees()])
      .then(([adminData, employeeData]) => {
        setAdmins(adminData);
        setEmployees(employeeData);
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

  const sortedAdmins = useMemo(() => {
    return [...admins].sort((a, b) => a.name.localeCompare(b.name));
  }, [admins]);

  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => a.name.localeCompare(b.name));
  }, [employees]);

  const sortedClients = useMemo(() => {
    return Object.values(clients).sort((a, b) => a.name.localeCompare(b.name));
  }, [clients]);

  const sortedAgents = useMemo(() => {
    return Object.values(agents).sort((a, b) => a.name.localeCompare(b.name));
  }, [agents]);

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
   * Filter entity options based on the search text.
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

  const entityOptions = useMemo(() => {
    return filteredEntityOptions.slice(0, visibleRows);
  }, [filteredEntityOptions, visibleRows]);

  // Dynamically load more rows when scrolled to the bottom
  useEffect(() => {
    if (inView && visibleRows < entityOptions.length) {
      setVisibleRows((prev) => prev + 20);
    }
  }, [inView, entityOptions.length, visibleRows]);

  // Manage infinite scrolling by loading more rows when in view.

  useEffect(() => {
    if (inView && visibleRows < filteredEntityOptions.length) {
      setVisibleRows((prev) =>
        Math.min(prev + 20, filteredEntityOptions.length)
      );
    }
  }, [inView, filteredEntityOptions.length, visibleRows]);

  const handleEntitySearch = useCallback((searchText: string) => {
    setEntitySearchText(searchText);
    setVisibleRows(20);
  }, []);

  const handleSaveChanges = useCallback(() => {
    if (!selectedEntity) return;

    const updatedData = {
      entityCode: selectedEntity.id,
      entityName: selectedEntity.name,
      role: role as UserRole,
    };

    if (user._id !== undefined) {
      setLoading(true);
      dispatch(updateUserById({ id: user._id, updatedData }))
        .then(() => {
          setAlertMessage(t("userDetails.updateSuccess"));
          setAlertSeverity("success");
          showToast.success(t("userDetails.updateSuccessToast"));
        })
        .catch((error: unknown) => {
          if (error instanceof Error) {
            setAlertMessage(
              t("userDetails.updateFailed", { message: error.message })
            );
            showToast.error(
              t("userDetails.updateFailedToast", { message: error.message })
            );
          } else {
            setAlertMessage(t("userDetails.updateUnknownError"));
            showToast.error(t("userDetails.updateUnknownErrorToast"));
          }
          setAlertSeverity("error");
          console.error("Error updating user:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setAlertMessage(t("userDetails.userIdUndefined"));
      setAlertSeverity("error");
      showToast.error(t("userDetails.userIdUndefinedToast"));
      console.error("User ID is undefined");
    }
  }, [selectedEntity, role, user._id, dispatch, t]);

  // New handleDeleteUser function
  const handleDeleteUser = useCallback(
    (userId: string) => {
      setLoading(true);
      dispatch(deleteUserByIdThunk(userId))
        .then(() => {
          showToast.success(t("userDetails.deleteSuccessToast"));
        })
        .catch((error: unknown) => {
          if (error instanceof Error) {
            showToast.error(
              t("userDetails.deleteFailedToast", { message: error.message })
            );
          } else {
            showToast.error(t("userDetails.deleteUnknownErrorToast"));
          }
          console.error("Error deleting user:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [dispatch, t]
  );

  return {
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
    user,
    alertMessage,
    setAlertMessage,
    alertSeverity,
    handleDeleteUser,
  };
};

export default useUserDetails;
