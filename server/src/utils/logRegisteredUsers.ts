import fs from "fs";
import path from "path";
import { IUser } from "../models/User";
import { readFile, resolveFilePath, writeFile } from "./fileUtils";
import logger from "./logger";

const LOG_FILE_PATH = resolveFilePath("data/registeredUsersLog.json");

export const logRegisteredUser = (user: IUser) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    email: user.email,
    role: user.role,
  };

  const logDir = path.dirname(LOG_FILE_PATH);
  if (!fs.existsSync(logDir)) {
    logger.info(`Directory ${logDir} does not exist. Creating...`);
    try {
      fs.mkdirSync(logDir, { recursive: true });
      logger.info(`Directory ${logDir} created successfully.`);
    } catch (err) {
      logger.error(`Failed to create directory ${logDir}:`, err);
      return;
    }
  }

  if (!fs.existsSync(LOG_FILE_PATH)) {
    logger.info(`File ${LOG_FILE_PATH} does not exist. Creating...`);
    try {
      writeFile(LOG_FILE_PATH, []);
      logger.info(`File ${LOG_FILE_PATH} created successfully.`);
    } catch (err) {
      logger.error(`Failed to create file ${LOG_FILE_PATH}:`, err);
      return;
    }
  }

  try {
    const data = readFile(LOG_FILE_PATH);
    const logs = data ? JSON.parse(data) : [];
    logs.push(logEntry);

    writeFile(LOG_FILE_PATH, logs);
    logger.info(`Log entry added to ${LOG_FILE_PATH}`);
  } catch (err) {
    logger.error("Error reading or writing log file:", { error: err });
  }
};
