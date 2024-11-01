// src/services/agentService.ts
import Agent, { IAgent } from "../models/Agent";

export const getAllAgents = async (): Promise<IAgent[]> => {
  try {
    const agents = await Agent.find().exec();
    return agents;
  } catch (error) {
    console.error("Error fetching agents:", error);
    throw new Error("Error fetching agents");
  }
};

export const getAgentById = async (id: string): Promise<IAgent | null> => {
  try {
    const agent = await Agent.findOne({ id }).exec();
    return agent;
  } catch (error) {
    console.error(`Error fetching agent with id ${id}:`, error);
    throw new Error("Error fetching agent by ID");
  }
};

export const getAgentByClientEntityCode = async (
  clientEntityCode: string
): Promise<IAgent | null> => {
  try {
    const agents = await Agent.aggregate([
      { $match: { "clients.CODICE": clientEntityCode } },
      {
        $project: {
          id: 1,
          name: 1,
          email: 1,
          phone: 1,
          clients: {
            $filter: {
              input: "$clients",
              as: "client",
              cond: { $eq: ["$$client.CODICE", clientEntityCode] },
            },
          },
        },
      },
    ]).exec();

    if (agents.length === 0) {
      return null;
    }

    return agents[0] as IAgent;
  } catch (error) {
    console.error(
      `Error fetching agent by client entity code ${clientEntityCode}:`,
      error
    );
    throw new Error("Error fetching agent by client entity code");
  }
};

export const updateAgentById = async (
  id: string,
  updatedAgentData: Partial<IAgent>
): Promise<IAgent | null> => {
  try {
    const updatedAgent = await Agent.findOneAndUpdate(
      { id },
      { $set: updatedAgentData },
      { new: true, runValidators: true }
    ).exec();
    return updatedAgent;
  } catch (error: any) {
    console.error(`Error updating agent with id ${id}:`, error);
    throw error;
  }
};

export const replaceAgentById = async (
  id: string,
  newAgentData: IAgent
): Promise<IAgent | null> => {
  try {
    const replacedAgent = await Agent.findOneAndReplace({ id }, newAgentData, {
      new: true,
      runValidators: true,
    }).exec();
    return replacedAgent;
  } catch (error: any) {
    console.error(`Error replacing agent with id ${id}:`, error);
    throw error;
  }
};

export const createAgentService = async (agentData: {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  clients?: any[];
}): Promise<IAgent> => {
  try {
    const newAgent = new Agent(agentData);
    await newAgent.save();
    return newAgent;
  } catch (error: any) {
    console.error("Error creating agent:", error);
    throw error;
  }
};

export const deleteAgentService = async (id: string): Promise<boolean> => {
  try {
    const result = await Agent.deleteOne({ id }).exec();
    return result.deletedCount === 1;
  } catch (error) {
    console.error(`Error deleting agent with id ${id}:`, error);
    throw new Error("Error deleting agent");
  }
};
