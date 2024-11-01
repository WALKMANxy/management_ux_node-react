// src/features/data/entityThunks.ts
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

export const mapDataToAgent = (
  clients: Client[],
  agentDetail: Agent
): Agent => {
  return {
    ...agentDetail,
    clients: clients.filter((client) => client.agent === agentDetail.id),
  };
};

// Admin Thunks

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

// Agent Thunks

export const createAgentAsync = createAsyncThunk<
  Agent,
  Agent,
  { rejectValue: string; state: { data: DataSliceState } }
>("agent/createAgent", async (agentData, { rejectWithValue, getState }) => {
  try {
    const newAgent = await createAgent(agentData);

    const { clients } = (getState() as { data: DataSliceState }).data;

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

export const updateAgentAsync = createAsyncThunk<
  Agent,
  { id: string; updatedData: Partial<Agent> },
  { rejectValue: string; state: { data: DataSliceState } }
>(
  "agent/updateAgent",
  async ({ id, updatedData }, { rejectWithValue, getState }) => {
    try {
      const updatedAgent = await updateAgent(id, updatedData);

      const { clients: currentClients } = (
        getState() as { data: DataSliceState }
      ).data;

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

export const deleteAgentAsync = createAsyncThunk<
  string,
  string,
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

// Employee Thunks

export const createEmployeeAsync = createAsyncThunk<
  Employee,
  Employee,
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

export const updateEmployeeAsync = createAsyncThunk<
  Employee,
  { id: string; updatedData: Partial<Employee> },
  { rejectValue: string }
>(
  "employee/updateEmployee",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
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

export const deleteEmployeeAsync = createAsyncThunk<
  string,
  string,
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
