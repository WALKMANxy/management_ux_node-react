import { IUser, User } from "../models/User";

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
  static async getUsersByIds(ids: string[]): Promise<Partial<IUser>[]> {
    try {
      // Find users by the provided IDs and select only the required fields
      return await User.find({ _id: { $in: ids } })
        .select("_id avatar role entityName") // Select only the fields needed
        .exec();
    } catch (err) {
      throw new Error(
        `Error retrieving users by IDs: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }
}
