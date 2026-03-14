import express from "express";

import {
  createService,
  getServices,
  getSingleService,
  updateService,
  deleteService
} from "../controllers/serviceController.js";

import { isAdmin } from "../middleware/adminAuth.js";

const router = express.Router();


// USER ROUTES

router.get("/", getServices);

router.get("/:id", getSingleService);



// ADMIN ROUTES

router.post("/add", isAdmin, createService);

router.put("/update/:id", isAdmin, updateService);

router.delete("/delete/:id", isAdmin, deleteService);



export default router;