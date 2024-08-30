import { Request, Response } from "express";
import { config } from "../config/config";
import { AuthenticatedRequest } from "../models/types";
import { IUser } from "../models/User";
import { OAuthService } from "../services/OAuthService";
import {
  createSession,
  generateSessionToken,
  renewSession,
} from "../utils/sessionUtils";

export class OAuthController {
  static async handleOAuthCallback(req: Request, res: Response) {
    const { code } = req.body;

    if (typeof code !== "string") {
      return res.status(400).json({ message: "Invalid authorization code" });
    }

    try {
      const tokens = await OAuthService.getToken(code);
      const { id, email, name, picture } = await OAuthService.getUserInfo(
        tokens.access_token!
      );
      const user = await OAuthService.findOrCreateUser(
        id,
        email,
        name,
        picture
      );

      const sessionToken = generateSessionToken();
      await createSession(user.id.toString(), sessionToken, req);

      res.cookie("sessionToken", sessionToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      const redirectUrl = `${config.appUrl}/${user.role}-dashboard`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Error during OAuth callback", error);
      res.status(500).send("Authentication failed");
    }
  }

  static async refreshSession(req: AuthenticatedRequest, res: Response) {
    const sessionToken =
      req.cookies.sessionToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!sessionToken) {
      return res.status(401).json({ message: "No session token provided" });
    }

    try {
      const renewedSession = await renewSession(sessionToken, req);
      if (!renewedSession) {
        return res.status(401).json({ message: "Invalid or expired session" });
      }

      res.cookie("sessionToken", renewedSession.token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: renewedSession.expiresAt,
      });

      return res.status(200).json({
        message: "Session renewed successfully",
        expiresAt: renewedSession.expiresAt,
      });
    } catch (error) {
      console.error("Error renewing session:", error);
      return res.status(500).json({ message: "Failed to renew session" });
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
