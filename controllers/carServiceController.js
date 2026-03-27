import CarService from "../models/CarService.js";

// ADMIN - Create Car Service
export const createCarService = async (req, res) => {
  try {
    const { carServiceId, carNo, brandModel, userName, mobileNo, price } = req.body;

    if (!carServiceId || !carNo || !brandModel || !userName || !mobileNo || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "carServiceId, carNo, brandModel, userName, mobileNo and price are required",
      });
    }

    if (typeof price !== "number" || Number.isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid non-negative number",
      });
    }

    const carService = await CarService.create({
      carServiceId,
      carNo,
      brandModel,
      userName,
      mobileNo,
      price,
    });

    return res.status(201).json({
      success: true,
      message: "Car service created successfully",
      carService,
    });
  } catch (error) {
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
    const { carServiceId, carNo, brandModel, userName, mobileNo, price } = req.body;

    if (price !== undefined && (typeof price !== "number" || Number.isNaN(price) || price < 0)) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid non-negative number",
      });
    }

    const updateData = {};
    if (carServiceId !== undefined) updateData.carServiceId = carServiceId;
    if (carNo !== undefined) updateData.carNo = carNo;
    if (brandModel !== undefined) updateData.brandModel = brandModel;
    if (userName !== undefined) updateData.userName = userName;
    if (mobileNo !== undefined) updateData.mobileNo = mobileNo;
    if (price !== undefined) updateData.price = price;

    const carService = await CarService.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!carService) {
      return res.status(404).json({
        success: false,
        message: "Car service not found",
      });
    }

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
