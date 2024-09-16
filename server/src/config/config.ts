import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";

const nodeEnv = process.env.NODE_ENV

// Function to load environment-specific .env file
const loadEnvFile = () => {
  const envFile = path.resolve(process.cwd(), `.env.${nodeEnv}`);

  if (fs.existsSync(envFile)) {
    logger.info(`Loading environment variables from ${envFile}`);
    dotenv.config({ path: envFile });
  } else {
    logger.warn(
      `No .env.${nodeEnv} file found. Using default environment variables.`
    );
    dotenv.config(); // This will load the default .env file if it exists
  }
};

loadEnvFile();

export const config = {
  nodeEnv,
  jwtSecret: process.env.JWT_SECRET || "",
  mongoUri: process.env.MONGO_URI || "",
  port: process.env.PORT || "5000",
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  sslKeyPath: process.env.SSL_KEY_PATH || "",
  sslCertPath: process.env.SSL_CERT_PATH || "",
  clientDetailsFilePath: process.env.CLIENT_DETAILS_FILE_PATH || "",
  jsonFilePath: process.env.JSON_FILE_PATH || "",
  agentDetailsFilePath: process.env.AGENT_DETAILS_FILE_PATH || "",
  adminDetailsFilePath: process.env.ADMIN_DETAILS_FILE_PATH || "",
  ipinfoToken: process.env.IPINFO_TOKEN || "",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  redirectUri: process.env.REDIRECT_URI || "",
  baseUrl: process.env.BASE_URL || "",
  appUrl: process.env.APP_URL || "",
  cookieSecret: process.env.COOKIE_SECRET || "",
  emailFrom: process.env.EMAIL_FROM || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  passwordResetExpiresIn: process.env.PASSWORD_RESET_EXPIRES_IN || "1h",
  tunnelSubdomain: process.env.TUNNEL_SUBDOMAIN || "",
  refreshTokenDuration: process.env.REFRESH_TOKEN_DURATION || "7d",
  sessionDuration: process.env.SESSION_DURATION || "24d",
  emailHost: process.env.EMAIL_HOST || "",
  emailHostPort: process.env.EMAIL_HOST_PORT || "",
};

// Validate required environment variables
const requiredEnvVars = [
  "JWT_SECRET",
  "MONGO_URI",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "REDIRECT_URI",
  "COOKIE_SECRET",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    logger.error(`${envVar} is not set in the environment variables`);
    throw new Error(`${envVar} is not set in the environment variables`);
  }
});

// Additional validations
if (config.nodeEnv === "production") {
  if (!config.sslKeyPath || !config.sslCertPath) {
    logger.error(
      "SSL key and certificate paths are required in production mode"
    );
    throw new Error(
      "SSL key and certificate paths are required in production mode"
    );
  }
}

if (!config.smtpUser || !config.smtpPass) {
  logger.warn(
    "SMTP credentials are not set. Email functionality may not work properly."
  );
}

logger.info("Configuration loaded successfully", {
  environment: config.nodeEnv,
});
