import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { IUser, User } from "../models/User";
import { sendUserChangesConfirmationEmail } from "../utils/sendEmail";
import { Types } from "mongoose";

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
      // Convert string IDs to ObjectId instances
      const objectIds = ids.map(id => new Types.ObjectId(id));

      // Find users by the provided ObjectId array and select only the required fields
      return await User.find({ _id: { $in: objectIds } })
        .select("_id avatar role entityName entityCode") // Select only the fields needed
        .exec();
    } catch (err) {
      throw new Error(
        `Error retrieving users by IDs: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }

  static async updateUserEmail(
    id: string,
    currentEmail: string,
    currentPassword: string,
    newEmail: string
  ): Promise<IUser | null> {
    try {
      const user = await User.findById(id).exec();

      if (!user) {
        throw new Error("User not found");
      }

      // Validate current email and password
      if (
        user.email !== currentEmail ||
        !(await user.comparePassword(currentPassword))
      ) {
        throw new Error("Current email or password is incorrect");
      }

      // Update the email and set isEmailVerified to false
      user.email = newEmail;
      user.isEmailVerified = false;

      await user.save();

      // Generate verification token
      const verificationToken = jwt.sign({ id: user._id }, config.jwtSecret, {
        expiresIn: "1d",
      });

      // Send verification email
      await sendUserChangesConfirmationEmail(newEmail, verificationToken);

      return user;
    } catch (err) {
      throw new Error(
        `Error updating user email: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }

  // Update the user's password after validating the current password
  static async updateUserPassword(
    id: string,
    currentEmail: string,
    currentPassword: string,
    newPassword: string
  ): Promise<IUser | null> {
    try {
      const user = await User.findById(id).exec();

      if (!user) {
        throw new Error("User not found");
      }

      // Validate current email and password
      if (
        user.email !== currentEmail ||
        !(await user.comparePassword(currentPassword))
      ) {
        throw new Error("Current email or password is incorrect");
      }

      // Hash the new password and update it
      user.password = await bcrypt.hash(newPassword, 10);
      user.isEmailVerified = false;

      await user.save();

      // Generate verification token
      const verificationToken = jwt.sign({ id: user._id }, config.jwtSecret, {
        expiresIn: "1d",
      });

      // Send confirmation email
      await sendUserChangesConfirmationEmail(user.email, verificationToken);

      return user;
    } catch (err) {
      throw new Error(
        `Error updating user password: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }

  static async deleteUser(id: string): Promise<IUser | null> {
    try {
      const user = await User.findByIdAndDelete(id).exec();
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (err) {
      throw new Error(
        `Error deleting user: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }
  
}
