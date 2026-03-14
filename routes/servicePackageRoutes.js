import express from "express";
import {isAdmin} from "../middleware/adminAuth.js";


import {
  createServicePackage,
  getServicePackages,
  updateServicePackage,
  deleteServicePackage
} from "../controllers/servicePackageController.js";

const router = express.Router();

router.get("/get", getServicePackages);

router.post("/add",isAdmin, createServicePackage);

router.put("/update/:id", isAdmin, updateServicePackage);

router.delete("/delete/:id", isAdmin, deleteServicePackage);

export default router;