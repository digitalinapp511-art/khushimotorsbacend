import CarService from "../models/CarService.js";

const OFFLINE_FREE_SERVICE_TYPES = [
  "TOP",
  "FULL",
  "RUBBING",
  "POLISHING",
  "SERVICE",
  "DP",
  "FREE",
];

const isValidPrice = (price) =>
  typeof price === "number" && !Number.isNaN(price) && price >= 0;

const normalizeOfflineFreeType = (value) => {
  if (typeof value !== "string") return value;
  return value.trim().toUpperCase();
};

// ADMIN - Create Car Service
export const createCarService = async (req, res) => {
  try {
    const {
      carServiceId,
      carNo,
      brandModel,
      userName,
      mobileNo,
      token,
      price,
      offlineFreeType,
    } = req.body;
    const normalizedOfflineType = normalizeOfflineFreeType(offlineFreeType);

    if (!carServiceId || !carNo || !brandModel || !userName || !mobileNo) {
      return res.status(400).json({
        success: false,
        message: "carServiceId, carNo, brandModel, userName and mobileNo are required",
      });
    }

    if (price !== undefined && !isValidPrice(price)) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid non-negative number",
      });
    }

    if (normalizedOfflineType !== undefined && !OFFLINE_FREE_SERVICE_TYPES.includes(normalizedOfflineType)) {
      return res.status(400).json({
        success: false,
        message: `offlineFreeType must be one of: ${OFFLINE_FREE_SERVICE_TYPES.join(", ")}`,
      });
    }

    if (price === undefined && !normalizedOfflineType) {
      return res.status(400).json({
        success: false,
        message: "Either price or offlineFreeType is required",
      });
    }

    const carService = await CarService.create({
      carServiceId,
      carNo,
      brandModel,
      userName,
      mobileNo,
      token,
      price,
      offlineFreeType: normalizedOfflineType,
    });

    return res.status(201).json({
      success: true,
      message: "Car service created successfully",
      carService,
    });
  } catch (error) {
    console.error("Error creating car service:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create car service",
    });
  }
};

// ADMIN - Get All Car Services
export const getAllCarServices = async (req, res) => {
  try {
    const carServices = await CarService.find()
      .populate("carServiceId")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      carServices,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch car services",
    });
  }
};

// ADMIN - Get Single Car Service
export const getCarServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const carService = await CarService.findById(id).populate("carServiceId");

    if (!carService) {
      return res.status(404).json({
        success: false,
        message: "Car service not found",
      });
    }

    return res.json({
      success: true,
      carService,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch car service",
    });
  }
};

// ADMIN - Update Car Service
export const updateCarService = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      carServiceId,
      carNo,
      brandModel,
      userName,
      mobileNo,
      token,
      price,
      offlineFreeType,
    } = req.body;
    const normalizedOfflineType = normalizeOfflineFreeType(offlineFreeType);

    if (price !== undefined && !isValidPrice(price)) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid non-negative number",
      });
    }

    if (normalizedOfflineType !== undefined && !OFFLINE_FREE_SERVICE_TYPES.includes(normalizedOfflineType)) {
      return res.status(400).json({
        success: false,
        message: `offlineFreeType must be one of: ${OFFLINE_FREE_SERVICE_TYPES.join(", ")}`,
      });
    }

    const existingCarService = await CarService.findById(id);

    if (!existingCarService) {
      return res.status(404).json({
        success: false,
        message: "Car service not found",
      });
    }

    const updateData = {};
    if (carServiceId !== undefined) updateData.carServiceId = carServiceId;
    if (carNo !== undefined) updateData.carNo = carNo;
    if (brandModel !== undefined) updateData.brandModel = brandModel;
    if (userName !== undefined) updateData.userName = userName;
    if (mobileNo !== undefined) updateData.mobileNo = mobileNo;
    if (token !== undefined) updateData.token = token;
    if (price !== undefined) updateData.price = price;
    if (offlineFreeType !== undefined) updateData.offlineFreeType = normalizedOfflineType;

    const nextPrice = updateData.price !== undefined ? updateData.price : existingCarService.price;
    const nextOfflineType =
      updateData.offlineFreeType !== undefined
        ? updateData.offlineFreeType
        : existingCarService.offlineFreeType;

    if (nextPrice === undefined && !nextOfflineType) {
      return res.status(400).json({
        success: false,
        message: "Either price or offlineFreeType is required",
      });
    }

    const carService = await CarService.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return res.json({
      success: true,
      message: "Car service updated successfully",
      carService,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update car service",
    });
  }
};

// ADMIN - Delete Car Service
export const deleteCarService = async (req, res) => {
  try {
    const { id } = req.params;

    const carService = await CarService.findByIdAndDelete(id);

    if (!carService) {
      return res.status(404).json({
        success: false,
        message: "Car service not found",
      });
    }

    return res.json({
      success: true,
      message: "Car service deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete car service",
    });
  }
};
