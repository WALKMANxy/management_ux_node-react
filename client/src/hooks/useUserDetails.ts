// src/hooks/useUserDetails.ts

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { loadAdminDetailsData } from "../features/data/api/admins";
import { updateUserById } from "../features/users/userSlice";
import { Admin, Agent, Client, User, UserRole } from "../models/entityModels";
import { showToast } from "../utils/toastMessage";

const useUserDetails = (user: Partial<User>) => {
  const clients = useAppSelector((state) => state.data.clients);
  const agents = useAppSelector((state) => state.data.agents);

  const dispatch = useAppDispatch();

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [role, setRole] = useState<UserRole>(user.role || "guest");
  const [entityOptions, setEntityOptions] = useState<
    Client[] | Agent[] | Admin[]
  >([]);
  const [entitySearchText, setEntitySearchText] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<
    Client | Agent | Admin | null
  >(null);
  const [loadingEntities, setLoadingEntities] = useState(false);
  const [loading, setLoading] = useState(false);
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.1 });
  const [visibleRows, setVisibleRows] = useState(20);
  const [alertMessage, setAlertMessage] = useState<string | null>(null); // New state for alert messages
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(); // New state for alert severity

  // Fetch admins only once when the component mounts
  useEffect(() => {
    setLoadingEntities(true);
    loadAdminDetailsData()
      .then((data: Admin[]) => {
        setAdmins(data); // Store fetched admins
        setLoadingEntities(false);
      })
      .catch((error: Error) => {
        console.error("Error fetching admin data:", error);
        setLoadingEntities(false);
      });
  }, []);

  // Update entity options based on the selected role
  useEffect(() => {
    setEntityOptions([]); // Clear previous options when changing role
    setSelectedEntity(null); // Reset selected entity when changing role

    if (role === "admin") {
      setEntityOptions(admins.sort((a, b) => a.name.localeCompare(b.name)));
    } else if (role === "client") {
      const sortedClients = Object.values(clients).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setEntityOptions(sortedClients);
    } else if (role === "agent") {
      const sortedAgents = Object.values(agents).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setEntityOptions(sortedAgents);
    }
  }, [role, admins, clients, agents]);

  // Dynamically load more rows when scrolled to the bottom
  useEffect(() => {
    if (inView && visibleRows < entityOptions.length) {
      setVisibleRows((prev) => prev + 20);
    }
  }, [inView, entityOptions.length, visibleRows]);

  // Search entities based on role
  const handleEntitySearch = (searchText: string) => {
    setEntitySearchText(searchText);
    const searchLower = searchText.toLowerCase();

    if (role === "client") {
      const filteredClients = Object.values(clients).filter(
        (client) =>
          client.name.toLowerCase().includes(searchLower) ||
          client.id.toLowerCase().includes(searchLower)
      );
      setEntityOptions(filteredClients);
    } else if (role === "agent") {
      const filteredAgents = Object.values(agents).filter(
        (agent) =>
          agent.name.toLowerCase().includes(searchLower) ||
          agent.id.toLowerCase().includes(searchLower)
      );
      setEntityOptions(filteredAgents);
    } else if (role === "admin") {
      const filteredAdmins = admins.filter(
        (admin) =>
          admin.name.toLowerCase().includes(searchLower) ||
          admin.id.toLowerCase().includes(searchLower)
      );
      setEntityOptions(filteredAdmins);
    }
  };

  const handleSaveChanges = () => {
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
          setAlertMessage("User updated successfully");
          setAlertSeverity("success");
          showToast.success("User updated successfully.");
        })
        .catch((error: unknown) => {
          if (error instanceof Error) {
            setAlertMessage("Failed to update user: " + error.message);
            showToast.error("Failed to update user: " + error.message);
          } else {
            setAlertMessage("Failed to update user. Server error.");
            showToast.error(
              "Failed to update user: An unknown error occurred."
            );
          }
          setAlertSeverity("error");
          console.error("Error updating user:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setAlertMessage("User ID is undefined");
      setAlertSeverity("error");
      showToast.error("User ID is undefined.");
      console.error("User ID is undefined");
    }
  };

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
  };
};

export default useUserDetails;
