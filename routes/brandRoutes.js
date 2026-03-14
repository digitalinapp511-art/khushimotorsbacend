import express from "express";
import {isAdmin} from "../middleware/adminAuth.js";
import authMiddleware from "../middleware/auth.middleware.js";


import {
  createBrand,
  getBrands,
  updateBrand,
  deleteBrand
} from "../controllers/brandController.js";

const router = express.Router();

router.get("/", getBrands);

router.post("/", isAdmin, createBrand);

router.put("/:id", isAdmin, updateBrand);

router.delete("/:id", isAdmin, deleteBrand);

export default router;