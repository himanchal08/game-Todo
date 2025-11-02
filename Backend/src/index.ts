import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./routes/authRoutes";
import habitRoutes from "./routes/habitRoutes";
import taskRoutes from "./routes/taskRoutes";
import xpRoutes from "./routes/xpRoutes";
import streakRoutes from "./routes/streakRoutes";
import proofRoutes from "./routes/proofRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";

// Import middleware
import { errorHandler } from "./middlewares/errorMiddleware";

// Import utilities
import { startCleanupSchedule } from "./utils/cleanup";
import { startNotificationSchedulers } from "./services/schedulerService";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "The API is running!" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/xp", xpRoutes);
app.use("/api/streaks", streakRoutes);
app.use("/api/proofs", proofRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/health`);

  // Start cleanup scheduler
  startCleanupSchedule();

  // Start notification schedulers
  startNotificationSchedulers();
});
