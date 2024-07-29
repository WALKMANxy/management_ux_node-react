import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const logDirPath = path.resolve('data'); // Resolves to the root directory
const logFilePath = path.join(logDirPath, 'ipLog.json');

interface IpInfo {
  ip: string;
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  [key: string]: any;
}

// Ensure data directory and log.json file exist
if (!fs.existsSync(logDirPath)) {
  fs.mkdirSync(logDirPath, { recursive: true });
}
if (!fs.existsSync(logFilePath)) {
  fs.writeFileSync(logFilePath, JSON.stringify([]));
}

const logRequestsIp = async (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip ? req.ip.replace('::ffff:', '') : 'unknown';
  if (clientIp === 'unknown') {
    console.error('Unable to determine client IP address');
    next();
    return;
  }
  
  try {
    const response = await axios.get(`https://ipinfo.io/${clientIp}?token=${process.env.IPINFO_TOKEN}`);
    const ipInfo: IpInfo = response.data;

    const logEntry = {
      timestamp: new Date().toISOString(),
      ...ipInfo
    };

    fs.readFile(logFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading log file:', err);
        return;
      }
      const logs = data ? JSON.parse(data) : [];
      logs.push(logEntry);

      fs.writeFile(logFilePath, JSON.stringify(logs, null, 2), (err) => {
        if (err) {
          console.error('Error writing log file:', err);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching IP information:', error);
  }

  next();
};

export default logRequestsIp;
