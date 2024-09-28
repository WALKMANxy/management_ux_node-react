//src/controllers/agentController.ts
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../models/types";
import {
  getAgentByClientEntityCode,
  getAgentById,
  getAgentsFromFile,
  replaceAgentById,
  updateAgentById,
} from "../services/agentService";

export const fetchAllAgents = (req: Request, res: Response) => {
  try {
    const agents = getAgentsFromFile();
    res.json(agents);
    return;
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    return;
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
    return;
  }
};

// New controller function to fetch an agent by client entity code
export const fetchAgentByClientEntityCode = (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user || !req.user.entityCode) {
      console.error(
        "Unauthorized access: User information is missing or incomplete."
      );
      return res.status(401).json({
        message: "Unauthorized: User information is missing or incomplete.",
      });
    }
    const clientEntityCode = req.user.entityCode;
  /*   console.log(
      "fetchAgentByClientEntityCode called with entityCode:",
      clientEntityCode
    ); // Debugging */

    const agent = getAgentByClientEntityCode(clientEntityCode);

    if (!agent) {
      console.warn(
        "Agent not found for the given client entity code:",
        clientEntityCode
      ); // Debugging
      return res
        .status(404)
        .json({ message: "Agent not found for the given client" });
    }

/*     console.log("Agent found:", agent); // Debugging
 */    res.json(agent);
    return;
  } catch (error) {
    console.error("Error in fetchAgentByClientEntityCode:", error); // Debugging
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};

export const updateAgent = (req: Request, res: Response) => {
  try {
    const updatedAgent = updateAgentById(req.params.id, req.body);
    if (!updatedAgent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    res
      .status(200)
      .json({ message: "Agent updated successfully", updatedAgent });
    return;
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    return;
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
    res
      .status(200)
      .json({ message: "Agent replaced successfully", replacedAgent });
    return;
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};
