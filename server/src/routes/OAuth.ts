import { Router } from "express";
import { OAuthController } from "../controllers/OAuthController";
import { authenticateUser } from "../middlewares/authentication";

const router = Router();

router.get("/oauth2/callback", OAuthController.handleOAuthCallback);

router.use(authenticateUser);

router.get("/link-google", OAuthController.linkGoogleAccount);

export default router;
