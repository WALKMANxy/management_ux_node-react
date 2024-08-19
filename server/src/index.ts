import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import fs from "fs";
import https from "https";
import localtunnel from "localtunnel";
import mongoose from "mongoose";
import { Server as SocketIOServer } from "socket.io";
import helmet from "helmet";
import { config } from "./config/config";
import { authenticateUser } from "./middlewares/authentication";
import { logRequestsIp } from "./middlewares/logRequests";
import { setupWebSocket } from "./middlewares/webSocket";
import adminRoutes from "./routes/admins";
import agentRoutes from "./routes/agents";
import setupAlertRoutes from "./routes/alerts";
import authRoutes from "./routes/auth";
import clientRoutes from "./routes/clients";
import movementsRoutes from "./routes/movements";
import oauthRoutes from "./routes/OAuth";
import promosRoutes from "./routes/promos";
import usersRoutes from "./routes/users";
import visitsRoutes from "./routes/visits";
import { errorHandler } from "./utils/errorHandler";

const app = express();
const PORT = config.port || "3000";

app.set("trust proxy", 1);

mongoose
  .connect(config.mongoUri!, {
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const corsOptions: cors.CorsOptions = {
  origin: config.appUrl,
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(logRequestsIp);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);

// Public routes
app.use("/auth", authRoutes);
app.use("/oauth", oauthRoutes);

// Protected routes
app.use(authenticateUser);
app.use("/agents", agentRoutes);
app.use("/admins", adminRoutes);
app.use("/clients", clientRoutes);
app.use("/movements", movementsRoutes);
app.use("/promos", promosRoutes);
app.use("/visits", visitsRoutes);
app.use("/users", usersRoutes);

app.use(errorHandler);

const httpsOptions = {
  key: fs.readFileSync(config.sslKeyPath!, "utf8"),
  cert: fs.readFileSync(config.sslCertPath!, "utf8"),
};

const server = https.createServer(httpsOptions, app);

const io = new SocketIOServer(server, {
  cors: corsOptions,
});

const { emitAlert } = setupWebSocket(io);

const alertRoutes = setupAlertRoutes(emitAlert);
app.use("/alerts", alertRoutes);

server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  if (process.env.NODE_ENV !== 'production') {
    try {
      const tunnel = await localtunnel({
        port: parseInt(PORT),
        subdomain: config.tunnelSubdomain,
        local_https: true,
        allow_invalid_cert: true,
      });
      console.log(`LocalTunnel running at ${tunnel.url}`);

      tunnel.on("close", () => {
        console.log("LocalTunnel closed");
      });
    } catch (error) {
      console.error("Error setting up LocalTunnel:", error);
    }
  }
});

export default app;