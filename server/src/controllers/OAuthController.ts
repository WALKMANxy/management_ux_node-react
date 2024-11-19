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
    console.log("Initiating Google OAuth process");

    const { state } = req.query;
    console.log("Received state:", state);

    const redirectUri = `${config.baseUrl}/oauth2/google/callback`;
    console.log("Redirect URI set to:", redirectUri);

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
      config.googleClientId
    }&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=email%20profile&state=${state}`;
    console.log("Constructed Google Auth URL:", googleAuthUrl);

    res.redirect(googleAuthUrl);
  }

  static async handleOAuthCallback(req: Request, res: Response) {
    const { code, state } = req.query;

    console.log("Handling OAuth callback:", req.query);

    if (typeof state !== "string") {
      return res.status(400).json({ message: "Invalid state parameter" });
    }

    // Decode the state parameter
    const decodedState = decodeURIComponent(state);
    console.log("Decoded state:", decodedState);

    // Split the state parameter using the delimiter
    const [randomState, uniqueId] = decodedState.split(":");

    console.log("Parsed state parameters:", { randomState, uniqueId });

    if (!randomState || !uniqueId) {
      return res.status(400).json({ message: "Invalid state parameter" });
    }

    if (typeof code !== "string") {
      return res.status(400).json({ message: "Invalid authorization code" });
    }


    try {
      // Proceed with token exchange and user creation
      const tokens = await OAuthService.getToken(code);
      console.log("Tokens:", tokens);

      const { id, email, name, picture } = await OAuthService.getUserInfo(
        tokens.access_token!
      );
      console.log("User info:", { id, email, name, picture });

      const user = await OAuthService.findOrCreateUser(
        id,
        email,
        name,
        picture
      );
      console.log("Created user:", user);

      const { accessToken, refreshToken } = await createSession(
        user,
        req as AuthenticatedRequest,
        uniqueId
      );

      console.log("Created session:", { accessToken, refreshToken });

      // Send the script to the client
      res.send(`
        <script>
          window.opener.postMessage({
            status: "success",
            state: "${randomState}",
            user: ${JSON.stringify({
              _id: user._id,
              email: user.email,
              name: user.entityName,
              role: user.role,
              avatar: user.avatar,
            })},
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
          window.opener.postMessage({ status: "error", state: "${randomState}" }, "${process.env.CLIENT_URL}");
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
