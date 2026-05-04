import CarService from "../models/CarService.js";
import Service from "../models/Service.js";
import { generateBookingToken } from "../services/tokenService.js";
import { shouldGenerateToken } from "../utils/serviceTypeChecker.js";

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

    // Get service details to check if token should be generated
    const service = await Service.findById(carServiceId);
    const serviceName = service?.name || '';
    
    // Check if this is a car service that should generate token
    const shouldGenerate = shouldGenerateToken(serviceName);
    let token = null;
    
    if (shouldGenerate) {
      console.log(" Car service - generating token for offline service");
      token = await generateBookingToken();
    } else {
      console.log(" Non-car service detected - skipping token generation for offline service");
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

// ADMIN - Get All Car Services (supports ?date=YYYY-MM-DD&search=...)
export const getAllCarServices = async (req, res) => {
  try {
    const { date, search } = req.query;

    // Resolve target date — default to today
    const targetDate = date ? new Date(date) : new Date();
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date format. Use YYYY-MM-DD." });
    }

    // Build start/end of the target day (ignores time component)
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
    const endOfDay   = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    const filter = { createdAt: { $gte: startOfDay, $lte: endOfDay } };

    // Apply search filter across userName, carNo, mobileNo
    if (search && search.trim()) {
      const q = search.trim();
      const digits = q.replace(/\D/g, "");
      const orClauses = [
        { userName: { $regex: q, $options: "i" } },
        { carNo:    { $regex: q, $options: "i" } },
        { mobileNo: { $regex: q, $options: "i" } },
      ];
      if (digits.length > 0) {
        orClauses.push({ mobileNo: { $regex: digits, $options: "i" } });
      }
      filter.$or = orClauses;
    }

    const carServices = await CarService.find(filter)
      .populate("carServiceId")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      carServices,
      total: carServices.length,
      date: startOfDay.toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("Error fetching car services:", error);
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

// ADMIN - Search Car Numbers for Autocomplete
export const searchCarNumbers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        suggestions: [],
      });
    }

    const searchQuery = query.trim().toUpperCase();
    
    // Find unique car numbers that match the query
    const carServices = await CarService.find({
      carNo: { $regex: searchQuery, $options: "i" }
    })
    .select('carNo brandModel userName mobileNo token price offlineFreeType carServiceId')
    .populate('carServiceId', 'name')
    .limit(10)
    .sort({ createdAt: -1 });

    // Group by car number and get the most recent entry for each
    const uniqueCarNumbers = {};
    carServices.forEach(service => {
      const carNo = service.carNo;
      if (!uniqueCarNumbers[carNo] || service.createdAt > uniqueCarNumbers[carNo].createdAt) {
        uniqueCarNumbers[carNo] = service;
      }
    });

    const suggestions = Object.values(uniqueCarNumbers).map(service => ({
      carNo: service.carNo,
      brandModel: service.brandModel,
      userName: service.userName,
      mobileNo: service.mobileNo,
      token: service.token || "",
      price: service.price || "",
      offlineFreeType: service.offlineFreeType || "",
      carServiceId: service.carServiceId?._id || service.carServiceId || "",
      serviceName: service.carServiceId?.name || "",
    }));

    return res.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("Error searching car numbers:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search car numbers",
    });
  }
};
