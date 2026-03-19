import express from "express";
import {isAdmin} from "../middleware/adminAuth.js";


import {
  createServicePackage,
  getServicePackages,
  updateServicePackage,
  deleteServicePackage
} from "../controllers/servicePackageController.js";

const router = express.Router();

/**
 * Service Package API
 * Base URL: /api/packages
 *
 * GET /get
 * - Public/User: Fetch packages.
 * - Optional query params:
 *   /get?serviceId=...&brandId=...&carModelId=...
 *
 * GET /get/:serviceId/:brandId/:carModelId
 * - Public/User: Fetch packages by service, brand and car model.
 *
 * POST /add
 * - Admin only.
 * - Body:
 *   {
 *     "serviceId": "SERVICE_OBJECT_ID",
 *     "packageName": "Basic | Standard | Premium",
 *     "price": 999,
 *     "features": ["Feature 1", "Feature 2"]
 *   }
 * - Note: Frontend must send `serviceId`. Do not send `serviceName`.
 *
 * PUT /update/:id
 * - Admin only.
 * - Body (partial update allowed):
 *   {
 *     "serviceId": "SERVICE_OBJECT_ID",
 *     "packageName": "Basic | Standard | Premium",
 *     "price": 1299,
 *     "features": ["Updated feature"]
 *   }
 * - Note: Frontend must send `serviceId` when updating service relation.
 *
 * DELETE /delete/:id
 * - Admin only.
 */
router.get("/get", getServicePackages);
router.get("/get/:serviceId/:brandId/:carModelId", getServicePackages);

router.post("/add",isAdmin, createServicePackage);

router.put("/update/:id", isAdmin, updateServicePackage);

router.delete("/delete/:id", isAdmin, deleteServicePackage);

export default router;
