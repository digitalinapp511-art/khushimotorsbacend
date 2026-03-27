import express from "express";
import { isAdmin } from "../middleware/adminAuth.js";
import {
  createCarService,
  getAllCarServices,
  getCarServiceById,
  updateCarService,
  deleteCarService,
} from "../controllers/carServiceController.js";

const router = express.Router();

// ADMIN ROUTES
router.post("/", isAdmin, createCarService);
router.get("/", isAdmin, getAllCarServices);
router.get("/:id", isAdmin, getCarServiceById);
router.put("/:id", isAdmin, updateCarService);
router.delete("/:id", isAdmin, deleteCarService);

export default router;
