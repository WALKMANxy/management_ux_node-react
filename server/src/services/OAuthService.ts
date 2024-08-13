import axios from "axios";
import { Credentials, OAuth2Client } from "google-auth-library";
import { config } from "../config/config";
import { IUser, User } from "../models/User";
import { GoogleUserInfo } from "../models/types";

export class OAuthService {
  private static oauth2Client = new OAuth2Client(
    config.googleClientId,
    config.googleClientSecret,
    config.redirectUri
  );

  static async getToken(code: string): Promise<Credentials> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      if (!tokens || !tokens.access_token) {
        throw new Error("Failed to obtain access token");
      }
      return tokens;
    } catch (error) {
      console.error("Error getting token:", error);
      throw new Error("Failed to exchange authorization code for tokens");
    }
  }

  static async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    try {
      const response = await axios.get<GoogleUserInfo>(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting user info:", error);
      throw new Error("Failed to fetch user information from Google");
    }
  }

  static async findOrCreateUser(
    googleId: string,
    email: string,
    name: string,
    picture: string
  ): Promise<IUser> {
    try {
      let user = await User.findOne({ googleId });
      if (!user) {
        user = new User({
          googleId,
          email,
          name,
          avatar: picture,
          role: "guest",
          isEmailVerified: true,
        });
      } else {
        user.email = email;
        user.avatar = picture;
        user.authType = "google"; // Update authType for existing users
      }
      await user.save();
      return user;
    } catch (error) {
      console.error("Error finding or creating user:", error);
      throw new Error("Failed to find or create user");
    }
  }

  static async linkGoogleAccount(
    user: IUser,
    googleId: string,
    email: string,
    picture: string
  ): Promise<IUser> {
    try {
      if (email !== user.email) {
        throw new Error(
          "The email associated with this Google account does not match the email of the current user"
        );
      }
      user.googleId = googleId;
      user.avatar = picture;
      await user.save();
      return user;
    } catch (error) {
      console.error("Error linking Google account:", error);
      throw new Error("Failed to link Google account");
    }
  }
}
