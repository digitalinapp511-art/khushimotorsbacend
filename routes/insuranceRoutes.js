import express from "express";
import { isAdmin } from "../middleware/adminAuth.js";
import { uploadInsuranceDocs } from "../middleware/insuranceUpload.js";
import {
  createInsurance,
  getInsuranceList,
  getSingleInsurance,
  updateInsurance,
  updateInsuranceStatus,
  deleteInsurance
} from "../controllers/insuranceController.js";

const router = express.Router();

const handleInsuranceUpload = (req, res, next) => {
  uploadInsuranceDocs(req, res, (error) => {
    if (!error) return next();

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Each file must be 10MB or smaller"
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Invalid file upload"
    });
  });
};

/**
 * Insurance API
 * Base URL: /api/insurance
 *
 * POST /add
 * - Submit insurance form.
 * - Content-Type: multipart/form-data
 * - Text fields:
 *   policyNo, insuranceCompany, vehicleNo, vehicleName, policyValidity,
 *   customerName, customerNumber, agentName, jobNumber
 * - File fields (required):
 *   policyDoc, rc, panAadhar
 * - Supported file formats:
 *   PDF, JPG, PNG
 *
 * GET /get
 * - Admin only. Get all insurance submissions.
 *
 * GET /:id
 * - Get single insurance record by id.
 *
 * PUT /update/:id
 * - Admin only. Update insurance details.
 * - Content-Type: multipart/form-data
 * - Any text/file field can be sent (all optional for update).
 * - File formats: PDF, JPG, PNG.
 *
 * PUT /status/:id
 * - Admin only. Update insurance status.
 * - Content-Type: application/json
 * - Body: { status }
 *
 * DELETE /delete/:id
 * - Admin only. Delete insurance record and uploaded files.
 */
router.post("/add", handleInsuranceUpload, createInsurance);
router.get("/get", isAdmin, getInsuranceList);
router.get("/:id", getSingleInsurance);
router.put("/update/:id", isAdmin, handleInsuranceUpload, updateInsurance);
router.put("/status/:id", isAdmin, updateInsuranceStatus);
router.delete("/delete/:id", isAdmin, deleteInsurance);

export default router;
