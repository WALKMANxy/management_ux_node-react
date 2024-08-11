import { Request, Response } from "express";
import { getAgentsFromFile, getAgentById, updateAgentById, replaceAgentById } from "../services/agentService";

export const fetchAllAgents = (req: Request, res: Response) => {
  try {
    const agents = getAgentsFromFile();
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const fetchAgentById = (req: Request, res: Response) => {
  try {
    const agent = getAgentById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateAgent = (req: Request, res: Response) => {
  try {
    const updatedAgent = updateAgentById(req.params.id, req.body);
    if (!updatedAgent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    res.status(200).json({ message: "Agent updated successfully", updatedAgent });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const replaceAgent = (req: Request, res: Response) => {
  try {
    const replacedAgent = replaceAgentById(req.params.id, {
      id: req.params.id,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      clients: req.body.clients,
    });

    if (!replacedAgent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    res.status(200).json({ message: "Agent replaced successfully", replacedAgent });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
