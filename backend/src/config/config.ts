import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  jwtSecret: process.env.JWT_SECRET || '',
  mongoUri: process.env.MONGO_URI || '',
  port: (process.env.PORT || '5000'),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  sslKeyPath: process.env.SSL_KEY_PATH || '',
  sslCertPath: process.env.SSL_CERT_PATH || '',
  clientDetailsFilePath: process.env.CLIENT_DETAILS_FILE_PATH || '',
  jsonFilePath: process.env.JSON_FILE_PATH || '',
  agentDetailsFilePath: process.env.AGENT_DETAILS_FILE_PATH || '',
  adminDetailsFilePath: process.env.ADMIN_DETAILS_FILE_PATH || '',
  ipinfoToken: process.env.IPINFO_TOKEN || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: process.env.REDIRECT_URI || '',
  baseUrl: process.env.BASE_URL || '',
  appUrl: process.env.APP_URL || ''
};

if (!config.jwtSecret) {
  throw new Error('JWT_SECRET is not set in the environment variables');
}

if (!config.mongoUri) {
  throw new Error('MONGO_URI is not set in the environment variables');
}
