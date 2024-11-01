// src/controllers/agentController.ts
import { Request, Response } from 'express';
import {
  getAgentByClientEntityCode,
  getAgentById,
  getAllAgents,
  replaceAgentById,
  updateAgentById,
  createAgentService,
  deleteAgentService,
} from '../services/agentService';
import { IAgent } from '../models/Agent';
import { isMongoDuplicateKeyError } from './adminController';


export const fetchAllAgents = async (req: Request, res: Response) => {
  try {
    const agents = await getAllAgents();
    res.json(agents);
  } catch (error) {
    console.error('Error in fetchAllAgents:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


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


export const fetchAgentByClientEntityCode = async (
  req: Request,
  res: Response
) => {
  try {
    const clientEntityCode = (req as any).user?.entityCode;

    if (!clientEntityCode) {
      console.error(
        'Unauthorized access: User information is missing or incomplete.'
      );
      return res.status(401).json({
        message: 'Unauthorized: User information is missing or incomplete.',
      });
    }

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


export const createAgent = async (req: Request, res: Response) => {
  try {
    const { id, name, email, clients } = req.body;

    if (!id || !name) {
      return res
        .status(400)
        .json({ message: 'Agent ID and name are required' });
    }

    const newAgent = await createAgentService({ id, name, email, clients });

    res.status(201).json({
      id: newAgent.id,
      name: newAgent.name,
      email: newAgent.email,
      clients: newAgent.clients,
    });
  } catch (error) {
    console.error('Error in createAgent:', error);

    if (isMongoDuplicateKeyError(error)) {
      const duplicatedField = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        message: `Agent with the given ${duplicatedField} already exists`,
      });
    }

    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateAgent = async (req: Request, res: Response) => {
  try {
    const adminId = req.params.id;
    const { name, email, phone, clients } = req.body;

    // At least one field must be provided for update
    if (!name && !email && !phone && !clients) {
      return res.status(400).json({
        message:
          'At least one of name, email, phone, or clients must be provided for update',
      });
    }

    const updatedAgent = await updateAgentById(adminId, {
      name,
      email,
      phone,
      clients,
    });

    if (!updatedAgent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json({
      id: updatedAgent.id,
      name: updatedAgent.name,
      email: updatedAgent.email,
      phone: updatedAgent.phone,
      clients: updatedAgent.clients,
    });
  } catch (error) {
    console.error(`Error in updateAgent for id ${req.params.id}:`, error);

    if (isMongoDuplicateKeyError(error)) {
      const duplicatedField = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        message: `${duplicatedField.charAt(0).toUpperCase() + duplicatedField.slice(1)} already in use`,
      });
    }

    res.status(500).json({ message: 'Internal Server Error' });
  }
};


export const deleteAgent = async (req: Request, res: Response) => {
  try {
    const agentId = req.params.id;
    const deleted = await deleteAgentService(agentId);

    if (!deleted) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.status(200).json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error(`Error in deleteAgent for id ${req.params.id}:`, error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


export const replaceAgent = async (req: Request, res: Response) => {
  try {
    const { id, name, email, phone, clients } = req.body;

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
    } as IAgent);

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
