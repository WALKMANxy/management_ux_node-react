import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import fs from "fs";
import https from "https";
import localtunnel from "localtunnel";
import mongoose from "mongoose";
import { config } from "./config/config"; // Import the config
import { authenticateUser } from "./middlewares/authentication";
import { logRequestsIp } from "./middlewares/logRequests";
import adminRoutes from "./routes/admins";
import agentRoutes from "./routes/agents";
import alertsRoutes from "./routes/alerts";
import authRoutes from "./routes/auth";
import clientRoutes from "./routes/clients";
import movementsRoutes from "./routes/movements";
import oauthRoutes from "./routes/OAuth";
import promosRoutes from "./routes/promos";
import usersRoutes from "./routes/users";
import visitsRoutes from "./routes/visits";
import { errorHandler } from "./utils/errorHandler";

const app = express();
const PORT = config.port || "";

app.set("trust proxy", 1); // Trust first proxy

mongoose
  .connect(config.mongoUri!, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const corsOptions: cors.CorsOptions = {
  origin: "https://woodcock-prime-obviously.ngrok-free.app", // Allow requests from this origin
  // origin: ['https://localhost:3000'],
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  optionsSuccessStatus: 200, // For legacy browser support
};

// Handle CORS preflight requests
app.options("*", cors(corsOptions)); // Preflight requests handling

app.use(cors(corsOptions));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(authenticateUser);
app.use(logRequestsIp); // Add the logging middleware here

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
app.use("/alerts", alertsRoutes);
app.use("/users", usersRoutes);

app.use(errorHandler);

const httpsOptions = {
  key: fs.readFileSync(config.sslKeyPath!, "utf8"),
  cert: fs.readFileSync(config.sslCertPath!, "utf8"),
};

/*  https.createServer(httpsOptions, app).listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});
 */
https.createServer(httpsOptions, app).listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  // Set up localtunnel with custom subdomain
  try {
    const tunnel = await localtunnel({
      port: parseInt(PORT),
      subdomain: "rcs-test-server547915", // Set your desired subdomain
      local_https: true,
      allow_invalid_cert: true,
    });
    console.log(`LocalTunnel running at ${tunnel.url} with port: ${PORT}`);

    tunnel.on("close", () => {
      console.log("LocalTunnel closed");
    });
  } catch (error) {
    console.error("Error setting up LocalTunnel:", error);
  }
});

export default app;
