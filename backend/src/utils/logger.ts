import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import axios from "axios";
import dotenv from "dotenv";
import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../models/types";
import { config } from "../config/config";
import { IpInfo } from "../models/types";

dotenv.config();

const { combine, timestamp, printf } = format;

const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let metaString = Object.entries(metadata).map(([key, value]) => `${key}: ${value}`).join(', ');
  return `${timestamp} [${level}]: ${message} ${metaString ? ` | ${metaString}` : ''}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }), // Ensures metadata is included
    logFormat
  ),
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      zippedArchive: true,
    }),
  ],
});

export const logRequestsIp = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Log basic request info immediately
  logger.info(`Incoming request: ${req.method} ${req.url}`, {
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    entityCode: req.user?.entityCode,
    ip: req.ip
  });

  // After response is sent, log IP info and other details
  res.on("finish", async () => {
    try {
      const clientIp = req.ip ? req.ip.replace("::ffff:", "") : "unknown";
      if (clientIp !== "unknown") {
        const response = await axios.get(
          `https://ipinfo.io/${clientIp}?token=${config.ipinfoToken}`
        );
        const ipInfo: IpInfo = response.data;

        // Log the IP information with user details
        logger.info(`IP info fetched`, {
          ip: ipInfo.ip,
          country: ipInfo.country,
          org: ipInfo.org,
          timezone: ipInfo.timezone,
          userId: req.user?.id,
          userEmail: req.user?.email,
          userRole: req.user?.role,
          entityCode: req.user?.entityCode,
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error fetching IP information: ${error.message}`);
      } else {
        logger.error(`An unknown error occurred: ${JSON.stringify(error)}`);
      }
    }
  });

  next();
};

export default logger;
