// src/thunks/entityThunks.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import { Admin, Agent, Client, Employee } from "../../models/entityModels";
import { DataSliceState } from "../../models/stateModels";
import { createAdmin, deleteAdmin, updateAdmin } from "./api/admins";
import { createAgent, deleteAgent, updateAgent } from "./api/agents";
import {
  createEmployee,
  deleteEmployee,
  updateEmployee,
} from "./api/employees";

/**
 * Utility function to map server entities to client entities.
 */
export const mapDataToAgent = (
  clients: Client[],
  agentDetail: Agent
): Agent => {
  return {
    ...agentDetail,
    clients: clients.filter((client) => client.agent === agentDetail.id),
  };
};

/**
 * ----------------------------
 * Admin Thunks
 * ----------------------------
 */

/**
 * Create a new Admin.
 */
export const createAdminAsync = createAsyncThunk<
  Admin, // Return type
  Admin, // Argument type (includes 'id')
  { rejectValue: string } // Reject type
>("admin/createAdmin", async (adminData, { rejectWithValue }) => {
  try {
    const newAdmin = await createAdmin(adminData);
    return newAdmin;
  } catch (error: unknown) {
    console.warn("Error in createAdminAsync:", error);
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Failed to create admin.");
  }
});

/**
 * Update an existing Admin.
 */
export const updateAdminAsync = createAsyncThunk<
  Admin, // Return type
  { id: string; updatedData: Partial<Admin> }, // Argument type (includes 'id' in updatedData)
  { rejectValue: string }
>("admin/updateAdmin", async ({ id, updatedData }, { rejectWithValue }) => {
  try {
    const updatedAdmin = await updateAdmin(id, updatedData);
    return updatedAdmin;
  } catch (error: unknown) {
    console.warn("Error in updateAdminAsync:", error);
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Failed to update admin.");
  }
});

/**
 * Delete an Admin.
 */
export const deleteAdminAsync = createAsyncThunk<
  string, // Return type (deleted Admin ID)
  string, // Argument type (Admin ID)
  { rejectValue: string }
>("admin/deleteAdmin", async (id, { rejectWithValue }) => {
  try {
    await deleteAdmin(id);
    return id;
  } catch (error: unknown) {
    console.warn("Error in deleteAdminAsync:", error);
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Failed to delete admin.");
  }
});

/**
 * ----------------------------
 * Agent Thunks
 * ----------------------------
 */

/**
 * Create a new Agent.
 */
export const createAgentAsync = createAsyncThunk<
  Agent, // Return type
  Agent, // Return type
  { rejectValue: string; state: { data: DataSliceState } } // Reject type and state type
>("agent/createAgent", async (agentData, { rejectWithValue, getState }) => {
  try {
    // Create the agent via API
    const newAgent = await createAgent(agentData);

    // Get current clients from state
    const { clients } = (getState() as { data: DataSliceState }).data;

    // Map the agent to include its clients
    const mappedAgent = mapDataToAgent(Object.values(clients), newAgent);

    return mappedAgent;
  } catch (error: unknown) {
    console.warn("Error in createAgentAsync:", error);
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Failed to create agent.");
  }
});

/**
 * Update an existing Agent.
 */
export const updateAgentAsync = createAsyncThunk<
  Agent, // Return type
  { id: string; updatedData: Partial<Agent> }, // Argument type (includes 'id' in updatedData)
  { rejectValue: string; state: { data: DataSliceState } }
>(
  "agent/updateAgent",
  async ({ id, updatedData }, { rejectWithValue, getState }) => {
    try {
      // Exclude 'createdAt', 'updatedAt', and 'clients' from updatedData

      // Update the agent via API
      const updatedAgent = await updateAgent(id, updatedData);

      // Get current clients from state
      const { clients: currentClients } = (
        getState() as { data: DataSliceState }
      ).data;

      // Map the agent to include its clients
      const mappedAgent = mapDataToAgent(
        Object.values(currentClients),
        updatedAgent
      );

      return mappedAgent;
    } catch (error: unknown) {
      console.warn("Error in updateAgentAsync:", error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update agent.");
    }
  }
);

/**
 * Delete an Agent.
 */
export const deleteAgentAsync = createAsyncThunk<
  string, // Return type (deleted Agent ID)
  string, // Argument type (Agent ID)
  { rejectValue: string }
>("agent/deleteAgent", async (id, { rejectWithValue }) => {
  try {
    await deleteAgent(id);
    return id;
  } catch (error: unknown) {
    console.warn("Error in deleteAgentAsync:", error);
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Failed to delete agent.");
  }
});

/**
 * ----------------------------
 * Employee Thunks
 * ----------------------------
 */

/**
 * Create a new Employee.
 */
export const createEmployeeAsync = createAsyncThunk<
  Employee, // Return type
  Employee, // Return type
  { rejectValue: string }
>("employee/createEmployee", async (employeeData, { rejectWithValue }) => {
  try {
    const newEmployee = await createEmployee(employeeData);
    return newEmployee;
  } catch (error: unknown) {
    console.warn("Error in createEmployeeAsync:", error);
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Failed to create employee.");
  }
});

/**
 * Update an existing Employee.
 */
export const updateEmployeeAsync = createAsyncThunk<
  Employee, // Return type
  { id: string; updatedData: Partial<Employee> }, // Argument type (includes 'id' in updatedData)
  { rejectValue: string }
>(
  "employee/updateEmployee",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      // Exclude 'createdAt' and 'updatedAt' from updatedData

      const updatedEmployee = await updateEmployee(id, updatedData);
      return updatedEmployee;
    } catch (error: unknown) {
      console.warn("Error in updateEmployeeAsync:", error);
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to update employee.");
    }
  }
);

/**
 * Delete an Employee.
 */
export const deleteEmployeeAsync = createAsyncThunk<
  string, // Return type (deleted Employee ID)
  string, // Argument type (Employee ID)
  { rejectValue: string }
>("employee/deleteEmployee", async (id, { rejectWithValue }) => {
  try {
    await deleteEmployee(id);
    return id;
  } catch (error: unknown) {
    console.warn("Error in deleteEmployeeAsync:", error);
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Failed to delete employee.");
  }
});
