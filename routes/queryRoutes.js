import express from "express";
import { isAdmin } from "../middleware/adminAuth.js";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  createQuery,
  getQueryList,
  updateQueryStatus,
  deleteQuery
} from "../controllers/queryController.js";

const router = express.Router();

// Customer
router.post("/add", authMiddleware, createQuery);

// Admin
router.get("/get", isAdmin, getQueryList);
router.patch("/status/:id", isAdmin, updateQueryStatus);
router.delete("/delete/:id", isAdmin, deleteQuery);

export default router;
