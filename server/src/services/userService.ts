import { IUser, User } from "../models/User";
import { getAgentById } from "../utils/fetchAgentUtil";
import { getClientById } from "../utils/fetchClientsUtil";

export class UserService {
  static async getAllUsers(): Promise<IUser[]> {
    try {
      return await User.find().select("-password").exec();
    } catch (err) {
      throw new Error(
        `Error retrieving users: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }

  static async getUserById(id: string): Promise<IUser | null> {
    try {
      return await User.findById(id).select("-password").exec();
    } catch (err) {
      throw new Error(
        `Error retrieving user by ID: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }

  static async getUserLinkedEntities(user: IUser): Promise<string[] | null> {
    try {
      if (!user.role || !user.entityCode) {
        throw new Error("User information is incomplete or missing");
      }

      if (user.role === "client") {
        const clientData = getClientById(user.entityCode);
        if (clientData) {
          return [clientData.AG];
        } else {
          throw new Error("Linked agent for client not found.");
        }
      } else if (user.role === "agent") {
        const agentData = getAgentById(user.entityCode);
        if (agentData) {
          return agentData.clients.map((client) => client.CODICE);
        } else {
          throw new Error("Agent data not found");
        }
      }

      return null;
    } catch (err) {
      throw new Error(
        `Error fetching linked entities: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }

  static async updateUser(
    id: string,
    userData: Partial<IUser>
  ): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(id, userData, {
        new: true,
        runValidators: true,
      }).exec();
    } catch (err) {
      throw new Error(
        `Error updating user: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }
}
