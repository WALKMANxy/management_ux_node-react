import { Router } from "express";
import { OAuthController } from "../controllers/OAuthController";

const router = Router();

router.get("/oauth2/callback", OAuthController.handleOAuthCallback);

router.get("/link-google", OAuthController.linkGoogleAccount);

export default router;
