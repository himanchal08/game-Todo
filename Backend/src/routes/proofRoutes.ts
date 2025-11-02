import { Router } from "express";
import {
  uploadProof,
  getTaskProofs,
  getUserProofs,
  deleteProof,
  getProofStats,
} from "../controllers/proofController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/uploadMiddleware";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Upload proof photo for a task
router.post("/upload", upload.single("proof"), uploadProof);

// Get all proofs for a specific task
router.get("/task/:taskId", getTaskProofs);

// Get all proofs for current user
router.get("/user", getUserProofs);

// Get proof statistics
router.get("/stats", getProofStats);

// Delete a proof
router.delete("/:id", deleteProof);

export default router;
