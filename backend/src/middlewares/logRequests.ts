import { Request, Response, NextFunction } from "express";
import axios from "axios";
import logger from "../utils/logger";
import { config } from "../config/config";
import { AuthenticatedRequest } from "../models/types";
import { IpInfo } from "../models/types";

const logRequests = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Log the incoming request
  logger.info(`Incoming request: ${req.method} ${req.url}`, {
    userId: req.user?.id,
    userRole: req.user?.role,
    entityCode: req.user?.entityCode,
    ip: req.ip
  });

  console.log("Incoming request:", req.method, req.url, req.ip);

  // Log response status on finish
  res.on("finish", () => {
    logger.info(`Response status: ${res.statusCode} for ${req.method} ${req.url}`, {
      userId: req.user?.id,
      userRole: req.user?.role,
      entityCode: req.user?.entityCode,
      ip: req.ip
    });
    console.log("Response status:", res.statusCode, req.method, req.url);
  });

  // Fetch and log IP information if needed
  const clientIp = req.ip ? req.ip.replace("::ffff:", "") : "unknown";
  if (clientIp !== "unknown") {
    try {
      const response = await axios.get(
        `https://ipinfo.io/${clientIp}?token=${config.ipinfoToken}`
      );
      const ipInfo: IpInfo = response.data;

      logger.info(`IP info fetched`, {
        timestamp: new Date().toISOString(),
        ip: ipInfo.ip,
        hostname: ipInfo.hostname,
        city: ipInfo.city,
        region: ipInfo.region,
        country: ipInfo.country,
        loc: ipInfo.loc,
        org: ipInfo.org,
        postal: ipInfo.postal,
        timezone: ipInfo.timezone,
        userId: req.user?.id,        // Log user information
        userEmail: req.user?.email,  // Log user information
        userRole: req.user?.role,    // Log user information
        entityCode: req.user?.entityCode,  // Log user information
      });

    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error fetching IP information: ${error.message}`);
      } else {
        logger.error(`An unknown error occurred: ${JSON.stringify(error)}`);
      }
    }
  }

  next();
};

export default logRequests;
