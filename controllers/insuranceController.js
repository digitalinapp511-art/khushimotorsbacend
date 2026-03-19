import Insurance from "../models/Insurance.js";
import cloudinary from "../config/cloudinary.js";

const addFileUrls = (insuranceDoc) => {
  const insurance = insuranceDoc.toObject ? insuranceDoc.toObject() : insuranceDoc;

  return {
    ...insurance,
    policyDocUrl: insurance.policyDoc || null,
    rcUrl: insurance.rc || null,
    panAadharUrl: insurance.panAadhar || null
  };
};

const uploadBufferToCloudinary = (file, folderName = "insurance") => new Promise((resolve, reject) => {
  const originalName = file.originalname || "document";
  const safeName = originalName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 60);

  const publicId = `${safeName || "document"}-${Date.now()}-${Math.round(Math.random() * 1e9)}`;

  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: `carmotor/${folderName}`,
      public_id: publicId,
      resource_type: "auto"
    },
    (error, result) => {
      if (error) return reject(error);
      resolve(result);
    }
  );

  uploadStream.end(file.buffer);
});

const extractPublicIdFromUrl = (fileUrl) => {
  if (!fileUrl) return null;

  try {
    const { pathname } = new URL(fileUrl);
    const match = pathname.match(/\/upload\/(?:v\d+\/)?(.+)$/);

    if (!match?.[1]) return null;
    return decodeURIComponent(match[1]).replace(/\.[^/.]+$/, "");
  } catch (_error) {
    return null;
  }
};

const getResourceTypeFromUrl = (fileUrl) => {
  if (fileUrl.includes("/raw/upload/")) return "raw";
  if (fileUrl.includes("/video/upload/")) return "video";
  return "image";
};

const deleteCloudinaryFile = async (fileUrl) => {
  if (!fileUrl) return;

  const publicId = extractPublicIdFromUrl(fileUrl);
  if (!publicId) return;

  await cloudinary.uploader.destroy(publicId, {
    resource_type: getResourceTypeFromUrl(fileUrl)
  });
};

// USER - Create Insurance
export const createInsurance = async (req, res) => {
  try {
    const {
      policyNo,
      insuranceCompany,
      vehicleNo,
      vehicleName,
      policyValidity,
      customerName,
      customerNumber,
      agentName,
      jobNumber,
    } = req.body;

    console.log("Received insurance creation request with data:", req.body);

    const requiredFields = {
      policyNo,
      insuranceCompany,
      vehicleNo,
      vehicleName,
      policyValidity,
      customerName,
      customerNumber
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => !String(value || "").trim())
      .map(([key]) => key);

    if (missingFields.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`
      });
    }

    const policyDocFile = req.files?.policyDoc?.[0];
    const rcFile = req.files?.rc?.[0];
    const panAadharFile = req.files?.panAadhar?.[0];

    if (!policyDocFile || !rcFile || !panAadharFile) {
      return res.status(400).json({
        success: false,
        message: "policyDoc, rc, and panAadhar files are required"
      });
    }
    const [policyDocUpload, rcUpload, panAadharUpload] = await Promise.all([
      uploadBufferToCloudinary(policyDocFile, "insurance/policy-docs"),
      uploadBufferToCloudinary(rcFile, "insurance/rc"),
      uploadBufferToCloudinary(panAadharFile, "insurance/pan-aadhar")
    ]);

    const insurance = await Insurance.create({
      policyNo,
      insuranceCompany,
      vehicleNo,
      vehicleName,
      policyValidity,
      customerName,
      customerNumber,
      agentName,
      jobNumber,
      policyDoc: policyDocUpload.secure_url,
      rc: rcUpload.secure_url,
      panAadhar: panAadharUpload.secure_url
    });

    return res.status(201).json({
      success: true,
      message: "Insurance submitted successfully",
      insurance: addFileUrls(insurance)
    });
  } catch (error) {
    if (error.message === "Only PDF, JPG, and PNG files are allowed") {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: "Insurance submission failed"
    });
  }
};

// ADMIN - Get All Insurance
export const getInsuranceList = async (req, res) => {
  try {
    const insuranceList = await Insurance.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      insuranceList: insuranceList.map((item) => addFileUrls(item))
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch insurance list"
    });
  }
};

// USER/ADMIN - Get Single Insurance
export const getSingleInsurance = async (req, res) => {
  try {
    const insurance = await Insurance.findById(req.params.id);

    if (!insurance) {
      return res.status(404).json({
        success: false,
        message: "Insurance record not found"
      });
    }

    return res.json({
      success: true,
      insurance: addFileUrls(insurance)
    });
  } catch (error) {
    console.error("Get single insurance error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch insurance record"
    });
  }
};

// ADMIN - Update Insurance
export const updateInsurance = async (req, res) => {
  try {
    const insurance = await Insurance.findById(req.params.id);

    if (!insurance) {
      return res.status(404).json({
        success: false,
        message: "Insurance record not found"
      });
    }

    const {
      policyNo,
      insuranceCompany,
      vehicleNo,
      vehicleName,
      policyValidity,
      customerName,
      customerNumber,
      agentName,
      jobNumber
    } = req.body;

    if (policyNo !== undefined) insurance.policyNo = policyNo;
    if (insuranceCompany !== undefined) insurance.insuranceCompany = insuranceCompany;
    if (vehicleNo !== undefined) insurance.vehicleNo = vehicleNo;
    if (vehicleName !== undefined) insurance.vehicleName = vehicleName;
    if (policyValidity !== undefined) insurance.policyValidity = policyValidity;
    if (customerName !== undefined) insurance.customerName = customerName;
    if (customerNumber !== undefined) insurance.customerNumber = customerNumber;
    if (agentName !== undefined) insurance.agentName = agentName;
    if (jobNumber !== undefined) insurance.jobNumber = jobNumber;

    const newPolicyDoc = req.files?.policyDoc?.[0];
    const newRc = req.files?.rc?.[0];
    const newPanAadhar = req.files?.panAadhar?.[0];

    if (newPolicyDoc) {
      const uploadedPolicyDoc = await uploadBufferToCloudinary(newPolicyDoc, "insurance/policy-docs");
      const oldUrl = insurance.policyDoc;
      insurance.policyDoc = uploadedPolicyDoc.secure_url;
      await deleteCloudinaryFile(oldUrl);
    }

    if (newRc) {
      const uploadedRc = await uploadBufferToCloudinary(newRc, "insurance/rc");
      const oldUrl = insurance.rc;
      insurance.rc = uploadedRc.secure_url;
      await deleteCloudinaryFile(oldUrl);
    }

    if (newPanAadhar) {
      const uploadedPanAadhar = await uploadBufferToCloudinary(newPanAadhar, "insurance/pan-aadhar");
      const oldUrl = insurance.panAadhar;
      insurance.panAadhar = uploadedPanAadhar.secure_url;
      await deleteCloudinaryFile(oldUrl);
    }

    await insurance.save();

    return res.json({
      success: true,
      message: "Insurance updated successfully",
      insurance: addFileUrls(insurance)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update insurance record"
    });
  }
};

// ADMIN - Update Insurance Status
export const updateInsuranceStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!String(status || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    const insurance = await Insurance.findById(req.params.id);

    if (!insurance) {
      return res.status(404).json({
        success: false,
        message: "Insurance record not found"
      });
    }

    insurance.status = status.trim();
    await insurance.save();

    return res.json({
      success: true,
      message: "Insurance status updated successfully",
      insurance: addFileUrls(insurance)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update insurance status"
    });
  }
};

// ADMIN - Delete Insurance
export const deleteInsurance = async (req, res) => {
  try {
    const insurance = await Insurance.findById(req.params.id);

    if (!insurance) {
      return res.status(404).json({
        success: false,
        message: "Insurance record not found"
      });
    }

    await Promise.all([
      deleteCloudinaryFile(insurance.policyDoc),
      deleteCloudinaryFile(insurance.rc),
      deleteCloudinaryFile(insurance.panAadhar)
    ]);

    await Insurance.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: "Insurance deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete insurance record"
    });
  }
};
