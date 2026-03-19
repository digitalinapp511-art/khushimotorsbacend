import multer from "multer";

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png"
];

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const isMimeValid = allowedMimeTypes.includes(file.mimetype);

  if (isMimeValid) {
    return cb(null, true);
  }

  cb(new Error("Only PDF, JPG, and PNG files are allowed"));
};

const insuranceUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB per file
  }
});

export const uploadInsuranceDocs = insuranceUpload.fields([
  { name: "policyDoc", maxCount: 1 },
  { name: "rc", maxCount: 1 },
  { name: "panAadhar", maxCount: 1 }
]);
