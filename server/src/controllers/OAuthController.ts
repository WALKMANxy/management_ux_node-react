//src/controllers/OAuthController.ts
import { Request, Response } from "express";
import { config } from "../config/config";
import { AuthenticatedRequest } from "../models/types";
import { IUser } from "../models/User";
import { OAuthService } from "../services/OAuthService";
import { logger } from "../utils/logger";
import {
  createSession,
  invalidateAllUserSessions,
  renewSession,
} from "../utils/sessionUtils";

export class OAuthController {
  static initiateGoogleOAuth(req: Request, res: Response) {
    const { state } = req.query;

    const redirectUri = `${config.appUrl}/auth/google/callback`;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
      config.googleClientId
    }&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=email%20profile&state=${state}`;

    res.redirect(googleAuthUrl);
  }

  static async handleOAuthCallback(req: Request, res: Response) {
    const { code, state } = req.query;

    const uniqueId = req.query.uniqueId;

    if (typeof uniqueId !== "string") {
      return res.status(400).json({ message: "Invalid or missing uniqueId" });
    }

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

      const { accessToken, refreshToken } = await createSession(
        user,
        req as AuthenticatedRequest,
        uniqueId
      );

      res.status(200).json({
        message: "OAuth login successful.",
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.entityName,
          picture: user.avatar,
        },
      });

      res.send(`
      <script>
          window.opener.postMessage({
              status: "success",
              state: "${state}",
              user: ${JSON.stringify(user)},
              accessToken: "${accessToken}",
              refreshToken: "${refreshToken}"
          }, "${process.env.CLIENT_URL}");
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

  static async refreshSession(req: Request, res: Response) {
    const { refreshToken, uniqueId } = req.body;

    if (!refreshToken || !uniqueId) {
      return res
        .status(400)
        .json({ message: "Refresh token and uniqueId are required." });
    }

    try {
      const renewedTokens = await renewSession(refreshToken, req, uniqueId);

      if (!renewedTokens) {
        return res.status(401).json({ message: "Invalid or expired session." });
      }

      return res.status(200).json({
        message: "Session renewed successfully.",
        accessToken: renewedTokens.accessToken,
        refreshToken: renewedTokens.refreshToken,
      });
    } catch (error: unknown) {
      logger.error("Error renewing session:", { error });
      return res.status(500).json({
        message: "Failed to renew session.",
        error: "Internal server error.",
      });
    }
  }

  static async linkGoogleAccount(req: AuthenticatedRequest, res: Response) {
    const { code, uniqueId } = req.body;
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

      if (updatedUser && updatedUser._id) {
        await invalidateAllUserSessions(updatedUser?._id?.toString());

        const { accessToken, refreshToken } = await createSession(
          updatedUser,
          req,
          uniqueId
        );

        // Respond with new tokens
        res.status(200).json({
          message: "Google account linked successfully.",
          accessToken,
          refreshToken,
          user: {
            id: updatedUser._id,
            email: updatedUser.email,
            name: updatedUser.entityName,
            picture: updatedUser.avatar,
          },
        });
      }
    } catch (error: unknown) {
      logger.error("Error during Google account linking", { error });
      res.status(500).json({
        message: "Failed to link Google account.",
        error: "Internal server error.",
      });
    }
  }
}
