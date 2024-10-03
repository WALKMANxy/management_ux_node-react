// src/controllers/agentController.ts
import { Request, Response } from 'express';
import {
  getAgentByClientEntityCode,
  getAgentById,
  getAllAgents,
  replaceAgentById,
  updateAgentById,
} from '../services/agentService';
import { AuthenticatedRequest } from '../models/types'; // Ensure this type is correctly defined
import { IAgent } from '../models/Agent';

/**
 * Fetch all agents.
 */
export const fetchAllAgents = async (req: Request, res: Response) => {
  try {
    const agents = await getAllAgents();

    // Map agents to include empty agents and clients arrays if necessary
    // Assuming you want to include clients as part of Agent, skip this step
    res.json(agents);
  } catch (error) {
    console.error('Error in fetchAllAgents:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Fetch an agent by ID.
 */
export const fetchAgentById = async (req: Request, res: Response) => {
  try {
    const agent = await getAgentById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.json(agent);
  } catch (error) {
    console.error(`Error in fetchAgentById for id ${req.params.id}:`, error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Fetch an agent by client's entity code.
 */
export const fetchAgentByClientEntityCode = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user || !req.user.entityCode) {
      console.error(
        'Unauthorized access: User information is missing or incomplete.'
      );
      return res.status(401).json({
        message: 'Unauthorized: User information is missing or incomplete.',
      });
    }
    const clientEntityCode = req.user.entityCode;

    const agent = await getAgentByClientEntityCode(clientEntityCode);

    if (!agent) {
      console.warn(
        'Agent not found for the given client entity code:',
        clientEntityCode
      );
      return res
        .status(404)
        .json({ message: 'Agent not found for the given client' });
    }

    res.json(agent);
  } catch (error) {
    console.error('Error in fetchAgentByClientEntityCode:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Update an agent by ID.
 */
export const updateAgent = async (req: Request, res: Response) => {
  try {
    const updatedAgent = await updateAgentById(req.params.id, req.body);
    if (!updatedAgent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res
      .status(200)
      .json({ message: 'Agent updated successfully', updatedAgent });
  } catch (error) {
    console.error(`Error in updateAgent for id ${req.params.id}:`, error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Replace an agent by ID.
 */
export const replaceAgent = async (req: Request, res: Response) => {
  try {
    const { id, name, email, phone, clients } = req.body;

    // Validate required fields
    if (!id || !name) {
      return res
        .status(400)
        .json({ message: 'Agent ID and name are required for replacement' });
    }

    const replacedAgent = await replaceAgentById(req.params.id, {
      id: req.params.id,
      name,
      email,
      phone,
      clients: clients || [],
    } as IAgent); // Ensure type casting aligns with your IAgent interface

    if (!replacedAgent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res
      .status(200)
      .json({ message: 'Agent replaced successfully', replacedAgent });
  } catch (error) {
    console.error(`Error in replaceAgent for id ${req.params.id}:`, error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
