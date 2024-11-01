//src/controllers/mediaController.ts
import { Request, Response } from "express";
import {
  generateChatFileDownloadUrl,
  generateChatFileUrl,
  generateSlideshowFileUrl,
} from "../services/mediaService";

export const getChatFileUploadUrl = async (req: Request, res: Response) => {
  const { chatId, messageId } = req.params;
  const { fileName } = req.query;

  if (!fileName) {
    return res.status(400).send("File name is required");
  }

  try {
    const uploadUrl = await generateChatFileUrl(
      chatId,
      messageId,
      fileName as string
    );
    res.json({ uploadUrl });
  } catch (error) {
    res.status(500).send("Error generating upload URL");
  }
};

// Controller for chat file download
export const getChatFileDownloadUrl = async (req: Request, res: Response) => {
  const { chatId, messageId, fileName } = req.params;

  try {
    const downloadUrl = await generateChatFileDownloadUrl(
      chatId,
      messageId,
      fileName
    );
    res.json({ downloadUrl });
  } catch (error) {
    res.status(500).send("Error generating download URL");
  }
};

// Controller for slideshow file uploads
export const getSlideshowFileUploadUrl = async (
  req: Request,
  res: Response
) => {
  const { currentMonth } = req.params;
  const { fileName } = req.query;

  if (!fileName) {
    return res.status(400).send("File name is required");
  }

  try {
    const uploadUrl = await generateSlideshowFileUrl(
      currentMonth,
      fileName as string
    );
    res.json({ uploadUrl });
  } catch (error) {
    res.status(500).send("Error generating upload URL");
  }
};
