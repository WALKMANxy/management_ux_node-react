import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import fs from "fs";
import helmet from "helmet";
import https from "https";
import mongoose from "mongoose";
import { Server as SocketIOServer } from "socket.io";
import { config } from "./config/config";
import { authenticateUser } from "./middlewares/authentication";
import { setupWebSocket } from "./middlewares/webSocket";
import adminRoutes from "./routes/admins";
import agentRoutes from "./routes/agents";
import authRoutes from "./routes/auth";
import calendarEventsRoutes from "./routes/calendarEvents"; // Import the new day-off request routes
import chatRoutes from "./routes/chats"; // Import chat routes
import clientRoutes from "./routes/clients";
import employeeRoutes from "./routes/employees";
import movementsRoutes from "./routes/movements";
import oauthRoutes from "./routes/OAuth";
import promosRoutes from "./routes/promos";
import usersRoutes from "./routes/users";
import visitsRoutes from "./routes/visits";
import citiesRoutes from "./routes/cities";
import { errorHandler } from "./utils/errorHandler";
import { logger, logRequestsIp } from "./utils/logger";
import { csp } from "./middlewares/csp";

const app = express();
const PORT = config.port || "3000";

app.set("trust proxy", 1);

mongoose
  .connect(config.mongoUri!, {})
  .then(() => logger.info("MongoDB connected"))
  .catch((err) => logger.error("MongoDB connection error:", { error: err }));

const corsOptions: cors.CorsOptions = {
  origin: config.appUrl,
  credentials: true,
  optionsSuccessStatus: 200,
};

console.log("CORS Origin:", corsOptions.origin);

app.use(csp);
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(cookieParser());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);

// Public routes
app.use("/auth", authRoutes);
app.use("/oauth2", oauthRoutes);

// Protected routes
app.use(authenticateUser);
app.use(logRequestsIp);
app.use("/agents", agentRoutes);
app.use("/admins", adminRoutes);
app.use("/clients", clientRoutes);
app.use("/movements", movementsRoutes);
app.use("/promos", promosRoutes);
app.use("/visits", visitsRoutes);
app.use("/users", usersRoutes);
app.use("/calendar", calendarEventsRoutes); // Register the day-off request routes
app.use("/chats", chatRoutes); // Add chat routes
app.use("/employees", employeeRoutes);
app.use("/cities", citiesRoutes);

app.use(errorHandler);

const httpsOptions = {
  key: fs.readFileSync(config.sslKeyPath!, "utf8"),
  cert: fs.readFileSync(config.sslCertPath!, "utf8"),
};

const server = https.createServer(httpsOptions, app);

const io = new SocketIOServer(server, {
  cors: {
    origin: config.appUrl,
    credentials: true,
  },
});

// Set up WebSocket with chat functionality
setupWebSocket(io);

// Log when the WebSocket server starts
logger.info("WebSocket server initialized");

server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || "development",
  });
});

export default app;
