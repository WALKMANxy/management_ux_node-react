//src/routes/media.ts
import { Router } from "express";
import {
  getChatFileDownloadUrl,
  getChatFileUploadUrl,
  getSlideshowFileUploadUrl,
} from "../controllers/mediaController";
import { authenticateUser } from "../middlewares/authentication";

const router = Router();

router.use(authenticateUser);

router.get("/chats/:chatId/:messageId", getChatFileUploadUrl);

router.get(
  "/chats/:chatId/:messageId/:fileName/download",
  getChatFileDownloadUrl
);

router.get("/slideshow/:currentMonth", getSlideshowFileUploadUrl);

export default router;
