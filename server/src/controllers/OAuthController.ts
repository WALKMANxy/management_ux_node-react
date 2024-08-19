import { Request, Response } from "express";
import { AuthenticatedRequest } from "../models/types";
import { IUser } from "../models/User";
import { OAuthService } from "../services/OAuthService";
import { generateAccessToken, generateRefreshToken } from "../utils/tokenUtils";
import { config } from "../config/config";

export class OAuthController {
  static async handleOAuthCallback(req: Request, res: Response) {
    const { code } = req.query;

    if (typeof code !== "string") {
      return res.status(400).json({ message: "Invalid authorization code" });
    }

    try {
      const tokens = await OAuthService.getToken(code);
      const { id, email, name, picture } = await OAuthService.getUserInfo(tokens.access_token!);
      const user = await OAuthService.findOrCreateUser(id, email, name, picture);

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      await user.save();

      res.cookie("accessToken", accessToken, { httpOnly: true, secure: true, sameSite: "none" });
      res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "none" });

      const redirectUrl = `${config.appUrl}/${user.role}-dashboard`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Error during OAuth callback", error);
      res.status(500).send("Authentication failed");
    }
  }

  static async linkGoogleAccount(req: AuthenticatedRequest, res: Response) {
    const { code } = req.query;
    const user = req.user as IUser;

    if (typeof code !== "string") {
      return res.status(400).json({ message: "Invalid authorization code" });
    }

    try {
      const tokens = await OAuthService.getToken(code);

      if (!tokens.access_token) {
        return res
          .status(500)
          .json({ message: "Failed to obtain access token" });
      }

      const { id, email, picture } = await OAuthService.getUserInfo(
        tokens.access_token
      );
      const updatedUser = await OAuthService.linkGoogleAccount(
        user,
        id,
        email,
        picture
      );
      res.status(200).json({
        message: "Google account linked successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error during Google account linking", error);
      res.status(500).json({ message: "Failed to link Google account", error });
    }
  }
}
