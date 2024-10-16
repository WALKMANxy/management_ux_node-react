import { Router } from 'express';
import { getChatFileDownloadUrl, getChatFileUploadUrl, getSlideshowFileUploadUrl } from '../controllers/mediaController';
import { authenticateUser } from '../middlewares/authentication';

const router = Router();

router.use(authenticateUser);


// Route to get a pre-signed URL for chat file uploads
router.get('/chats/:chatId/:messageId', getChatFileUploadUrl);

router.get('/chats/:chatId/:messageId/:fileName/download', getChatFileDownloadUrl);


// Route to get a pre-signed URL for slideshow file uploads
router.get('/slideshow/:currentMonth', getSlideshowFileUploadUrl);

export default router;
