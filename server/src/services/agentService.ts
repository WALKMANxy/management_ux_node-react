// src/services/agentService.ts

import Agent, { IAgent } from "../models/Agent";

/**
 * Fetch all agents from the database.
 * @returns Promise resolving to an array of Agent documents.
 */
export const getAllAgents = async (): Promise<IAgent[]> => {
  try {
    const agents = await Agent.find().exec();
    return agents;
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw new Error('Error fetching agents');
  }
};

/**
 * Fetch a single agent by ID from the database.
 * @param id - The ID of the agent to fetch.
 * @returns Promise resolving to an Agent document or null if not found.
 */
export const getAgentById = async (id: string): Promise<IAgent | null> => {
  try {
    const agent = await Agent.findOne({ id }).exec();
    return agent;
  } catch (error) {
    console.error(`Error fetching agent with id ${id}:`, error);
    throw new Error('Error fetching agent by ID');
  }
};

/**
 * Fetch an agent by a client's entity code.
 * @param clientEntityCode - The CODICE of the client.
 * @returns Promise resolving to an Agent document with filtered clients or null if not found.
 */
export const getAgentByClientEntityCode = async (
  clientEntityCode: string
): Promise<IAgent | null> => {
  try {
    // Using aggregation to match Agent with client CODICE and project only the matching client
    const agents = await Agent.aggregate([
      { $match: { 'clients.CODICE': clientEntityCode } },
      {
        $project: {
          id: 1,
          name: 1,
          email: 1,
          phone: 1,
          clients: {
            $filter: {
              input: '$clients',
              as: 'client',
              cond: { $eq: ['$$client.CODICE', clientEntityCode] },
            },
          },
        },
      },
    ]).exec();

    if (agents.length === 0) {
      return null;
    }

    // Since CODICE is unique per client, return the first matched agent
    return agents[0] as IAgent;
  } catch (error) {
    console.error(
      `Error fetching agent by client entity code ${clientEntityCode}:`,
      error
    );
    throw new Error('Error fetching agent by client entity code');
  }
};

/**
 * Update an agent by ID with the provided data.
 * @param id - The ID of the agent to update.
 * @param updatedAgentData - Partial data to update the agent.
 * @returns Promise resolving to the updated Agent document or null if not found.
 */
export const updateAgentById = async (
  id: string,
  updatedAgentData: Partial<IAgent>
): Promise<IAgent | null> => {
  try {
    const updatedAgent = await Agent.findOneAndUpdate(
      { id },
      { $set: updatedAgentData },
      { new: true, runValidators: true } // Return the updated document and run validators
    ).exec();
    return updatedAgent;
  } catch (error: any) {
    console.error(`Error updating agent with id ${id}:`, error);
    throw error; // Let the controller handle specific error responses
  }
};

/**
 * Replace an agent by ID with new data.
 * @param id - The ID of the agent to replace.
 * @param newAgentData - The new agent data.
 * @returns Promise resolving to the replaced Agent document or null if not found.
 */
export const replaceAgentById = async (
  id: string,
  newAgentData: IAgent
): Promise<IAgent | null> => {
  try {
    const replacedAgent = await Agent.findOneAndReplace(
      { id },
      newAgentData,
      { new: true, runValidators: true } // Return the replaced document and run validators
    ).exec();
    return replacedAgent;
  } catch (error: any) {
    console.error(`Error replacing agent with id ${id}:`, error);
    throw error; // Let the controller handle specific error responses
  }
};

/**
 * Create a new agent in the database.
 * @param agentData - The data for the new agent.
 * @returns Promise resolving to the created Agent document.
 */
export const createAgentService = async (agentData: {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  clients?: any[]; // Adjust the type based on your IClient interface
}): Promise<IAgent> => {
  try {
    const newAgent = new Agent(agentData);
    await newAgent.save();
    return newAgent;
  } catch (error: any) {
    console.error("Error creating agent:", error);
    throw error; // Let the controller handle specific error responses
  }
};

/**
 * Delete an agent by ID.
 * @param id - The ID of the agent to delete.
 * @returns Promise resolving to true if deleted, false if not found.
 */
export const deleteAgentService = async (id: string): Promise<boolean> => {
  try {
    const result = await Agent.deleteOne({ id }).exec();
    return result.deletedCount === 1;
  } catch (error) {
    console.error(`Error deleting agent with id ${id}:`, error);
    throw new Error("Error deleting agent");
  }
};
