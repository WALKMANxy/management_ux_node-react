import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  jwtSecret: process.env.JWT_SECRET || '',
  mongoUri: process.env.MONGO_URI || '',
  port: parseInt(process.env.PORT || '5000', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  sslKeyPath: process.env.SSL_KEY_PATH || '',
  sslCertPath: process.env.SSL_CERT_PATH || '',
  
};

if (!config.jwtSecret) {
  throw new Error('JWT_SECRET is not set in the environment variables');
}

if (!config.mongoUri) {
  throw new Error('MONGO_URI is not set in the environment variables');
}
