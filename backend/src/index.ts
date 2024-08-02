import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import compression from "compression";
import cookieParser from "cookie-parser";
import fs from "fs";
import https from "https";
import authRoutes from "./routes/auth";
import oauthRoutes from "./routes/OAuth";
import agentRoutes from "./routes/agents";
import adminRoutes from "./routes/admins";
import clientRoutes from "./routes/clients";
import promosRoutes from "./routes/promos";
import visitsRoutes from "./routes/visits";
import movementsRoutes from "./routes/movements";
import { errorHandler } from "./utils/errorHandler";
import logRequestsIp from "./utils/logRequestsIP";
import logRequests from "./middlewares/logRequests";
import { config } from "./config/config"; // Import the config

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
  origin: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(logRequestsIp); // Add the IP logging middleware here
app.use(logRequests); // Add the logging middleware here



const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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


app.use(errorHandler);


const httpsOptions = {
  key: fs.readFileSync(config.sslKeyPath!, 'utf8'),
  cert: fs.readFileSync(config.sslCertPath!, 'utf8'),
};

https.createServer(httpsOptions, app).listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});
 
export default app;
