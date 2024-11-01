//srcv/routes/OAuth.ts
import { Router } from "express";
import { OAuthController } from "../controllers/OAuthController";

const router = Router();

router.get("/google", OAuthController.initiateGoogleOAuth);

router.get("/google/callback", OAuthController.handleOAuthCallback);

router.post("/link-google", OAuthController.linkGoogleAccount);

export default router;
