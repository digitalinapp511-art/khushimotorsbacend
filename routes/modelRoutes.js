import express from "express";
import {isAdmin} from "../middleware/adminAuth.js";
import authMiddleware from "../middleware/auth.middleware.js";


import {
  createModel,
  getModelsByBrand,
  updateModel,
  deleteModel
} from "../controllers/modelController.js";

const router = express.Router();

router.get("/:brandId", getModelsByBrand);

router.post("/", isAdmin, createModel);

router.put("/:id", isAdmin, updateModel);

router.delete("/:id", isAdmin, deleteModel);

export default router;