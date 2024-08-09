import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import compression from "compression";
import cookieParser from "cookie-parser";
import fs from "fs";
import https from "https";
import http from "http";
import authRoutes from "./routes/auth";
import oauthRoutes from "./routes/OAuth";
import agentRoutes from "./routes/agents";
import adminRoutes from "./routes/admins";
import clientRoutes from "./routes/clients";
import promosRoutes from "./routes/promos";
import visitsRoutes from "./routes/visits";
import alertsRoutes from "./routes/alerts";
import movementsRoutes from "./routes/movements";
import usersRoutes from "./routes/users";
import { errorHandler } from "./utils/errorHandler";
import logRequestsIp from "./utils/logRequestsIP";
import logRequests from "./middlewares/logRequests";
import { config } from "./config/config"; // Import the config
import localtunnel from "localtunnel";


console.log(`JWT_SECRET inside config: ${config.jwtSecret}`);  // Check if JWT_SECRET is loaded
console.log(`PORT inside config: ${config.port}`);  // Check if JWT_SECRET is loaded



const app = express();
const PORT = (config.port || "");

app.set('trust proxy', 1); // Trust first proxy


mongoose
  .connect(config.mongoUri!, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

  const corsOptions: cors.CorsOptions = {
    origin: 'https://woodcock-prime-obviously.ngrok-free.app', // Allow requests from this origin
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    optionsSuccessStatus: 200, // For legacy browser support
  };

  // Handle CORS preflight requests
app.options('*', cors(corsOptions)); // Preflight requests handling

app.use(cors(corsOptions));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(logRequestsIp); // Add the IP logging middleware here
app.use(logRequests); // Add the logging middleware here



const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000000,
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);

app.use("/auth", authRoutes);
app.use("/oauth", oauthRoutes);
app.use("/agents", agentRoutes);
app.use("/admins", adminRoutes);
app.use("/clients", clientRoutes);
app.use("/movements", movementsRoutes);
app.use("/promos", promosRoutes);
app.use("/visits", visitsRoutes);
app.use("/alerts", alertsRoutes);
app.use("/users", usersRoutes);


app.use(errorHandler);


const httpsOptions = {
  key: fs.readFileSync(config.sslKeyPath!, 'utf8'),
  cert: fs.readFileSync(config.sslCertPath!, 'utf8'),
};

 https.createServer(httpsOptions, app).listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});

/* https.createServer(httpsOptions, app).listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

   // Set up localtunnel with custom subdomain
   try {
    const tunnel = await localtunnel({
      port: parseInt(PORT),
      subdomain: 'rcs-test-server547915', // Set your desired subdomain
      local_https: true,
      allow_invalid_cert: true,
    });
    console.log(`LocalTunnel running at ${tunnel.url} with port: ${PORT}`);

    tunnel.on('close', () => {
      console.log('LocalTunnel closed');
    });
  } catch (error) {
    console.error('Error setting up LocalTunnel:', error);
  }
}); */


export default app;
