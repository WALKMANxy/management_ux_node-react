import { Request, Response } from "express";
import { AuthenticatedRequest } from "../models/types";
import { IUser } from "../models/User";
import { OAuthService } from "../services/OAuthService";
import { generateSessionToken } from "../utils/jwtUtils";
import { createSession, renewSession } from "../utils/sessionUtils";
import { config } from "../config/config";

export class OAuthController {

  static initiateGoogleOAuth(req: Request, res: Response) {
    const { state } = req.query;

    const redirectUri = `${config.appUrl}/auth/google/callback`;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile&state=${state}`;

    res.redirect(googleAuthUrl);
  }


  static async handleOAuthCallback(req: Request, res: Response) {
    const { code, state } = req.query;

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

      const sessionToken = generateSessionToken(user);
      await createSession(user.id.toString(), sessionToken, req);

      res.cookie("sessionToken", sessionToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      // Send a message to the opener window
      res.send(`
        <script>
          window.opener.postMessage({ status: "success", state: "${state}", user: ${JSON.stringify(user)} }, "${process.env.CLIENT_URL}");
          window.close();
        </script>
      `);
    } catch (error) {
      console.error("Error during OAuth callback", error);
      res.send(`
        <script>
          window.opener.postMessage({ status: "error", state: "${state}" }, "${process.env.CLIENT_URL}");
          window.close();
        </script>
      `);
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
    const { code } = req.body;
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

      // Create a new session for the user
      const sessionToken = generateSessionToken(updatedUser);
      await createSession(updatedUser.id.toString(), sessionToken, req);

      res.cookie("sessionToken", sessionToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      res.status(200).json({
        message: "Google account linked successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error during Google account linking", error);
      res.status(500).json({ message: "Failed to link Google account" });
    }
  }
}
