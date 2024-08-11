import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import axios from "axios";
import dotenv from "dotenv";
import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../models/types";
import { config } from "../config/config";
import { IpInfo } from "../models/types";
import { LRUCache } from 'lru-cache';

dotenv.config();

const { combine, timestamp, printf } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    new transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      zippedArchive: true,
    }),
  ],
});

// LRU cache for IP info
const ipInfoCache = new LRUCache<string, IpInfo>({
  max: 500, // Maximum number of items to store in the cache
  ttl: 1000 * 60 * 60 // 1 hour
});

// Function to fetch IP info
async function fetchIpInfo(ip: string): Promise<IpInfo | null> {
  try {
    const response = await axios.get(
      `https://ipinfo.io/${ip}?token=${config.ipinfoToken}`
    );
    return response.data;
  } catch (error) {
    logger.error(`Error fetching IP information: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

export const logRequestsIp = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const clientIp = req.ip ? req.ip.replace("::ffff:", "") : "unknown";
  let ipInfo: IpInfo | null = null;

  if (clientIp !== "unknown") {
    ipInfo = ipInfoCache.get(clientIp) || null;
    if (!ipInfo) {
      ipInfo = await fetchIpInfo(clientIp);
      if (ipInfo) {
        ipInfoCache.set(clientIp, ipInfo);
      }
    }
  }

  const logData = {
    userEmail: req.user?.email,
    userRole: req.user?.role,
    entityCode: req.user?.entityCode,
    ip: clientIp,
    ipInfo: ipInfo
  };

  const ipInfoString = ipInfo
    ? `[${ipInfo.ip}, country: ${ipInfo.country}, org: ${ipInfo.org}, timezone: ${ipInfo.timezone}]`
    : `[${clientIp}]`;

  logger.info(`Incoming request ${req.method}${req.url} : from: ${logData.userEmail}, ${logData.userRole}, ${logData.entityCode} | ipInfo: ${ipInfoString}`);

  res.on("finish", () => {
    logger.info(`Response status: ${res.statusCode} for ${req.method} ${req.url} | User data: [email: ${logData.userEmail}, role: ${logData.userRole}, code: ${logData.entityCode}]`);
  });

  next();
};

export default logRequestsIp;