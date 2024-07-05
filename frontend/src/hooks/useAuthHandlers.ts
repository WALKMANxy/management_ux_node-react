// features/hooks/useAuthHandlers.ts
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../app/store";
import { login, logout } from "../features/auth/authSlice";
import { setAgentClients } from "../features/data/dataSlice";
import { AuthHandlersProps } from "../models/models";
import {
  useGetAgentsQuery,
  useGetClientByIdQuery,
  useGetMinimalAgentsQuery,
  useGetMinimalClientsQuery,
} from "../services/api";

const useAuthHandlers = ({
  selectedRole,
  selectedAgent,
  selectedClient,
  agents,
}: AuthHandlersProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userRole = useSelector((state: RootState) => state.auth.userRole);
  const { refetch: refetchMinimalClients } = useGetMinimalClientsQuery();
  const { refetch: refetchMinimalAgents } = useGetMinimalAgentsQuery();
  const { refetch: refetchAgents } = useGetAgentsQuery();
  const { data: fullClient, refetch: refetchClientById } =
    useGetClientByIdQuery(selectedClient, { skip: !selectedClient });

  const handleLogin = useCallback(async () => {
    if (selectedRole === "agent" && selectedAgent) {
      const agent = agents.find((agent) => agent.id === selectedAgent);
      if (agent) {
        dispatch(setAgentClients(agent.clients)); // Save the clients of the agent to state
      }
      dispatch(login({ role: selectedRole, id: selectedAgent }));
    } else if (selectedRole === "client" && selectedClient) {
      await refetchClientById();
      if (fullClient) {
        dispatch(setAgentClients([fullClient])); // Save the full client details to state
      }
      dispatch(login({ role: selectedRole, id: selectedClient }));
    } else if (selectedRole === "admin") {
      dispatch(login({ role: selectedRole, id: "" })); // Admin can see all data
    } else {
      dispatch(login({ role: "guest", id: "" })); // Default to guest
    }
  }, [
    selectedRole,
    selectedAgent,
    selectedClient,
    agents,
    fullClient,
    dispatch,
    refetchClientById,
  ]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    dispatch(setAgentClients([])); // Clear agent clients
    refetchMinimalClients(); // Refetch minimal clients data
    refetchMinimalAgents(); // Refetch minimal agents data
    refetchAgents(); // Refetch agents data
    navigate("/"); // Navigate to home page
  }, [
    dispatch,
    refetchMinimalClients,
    refetchMinimalAgents,
    refetchAgents,
    navigate,
  ]);

  const handleEnter = useCallback(() => {
    switch (userRole) {
      case "admin":
        navigate("/admin-dashboard");
        break;
      case "agent":
        navigate("/agent-dashboard");
        break;
      case "client":
        navigate("/client-dashboard");
        break;
      default:
        navigate("/");
    }
  }, [userRole, navigate]);

  return { handleLogin, handleLogout, handleEnter };
};

export default useAuthHandlers;
