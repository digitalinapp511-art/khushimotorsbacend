import mongoose from "mongoose";
import ServicePackage from "../models/ServicePackage.js";
import Service from "../models/Service.js";
import Brand from "../models/Brand.js";
import CarModel from "../models/CarModel.js";

// ADMIN - Add Package
export const createServicePackage = async (req, res) => {
  try {
    if (req.body.serviceName !== undefined) {
      return res.status(400).json({
        success: false,
        message: "Use serviceId in request body. serviceName is not supported."
      });
    }

    if (req.body.brand !== undefined) {
      return res.status(400).json({
        success: false,
        message: "Use brandId in request body. brand is not supported."
      });
    }

    if (req.body.carModel !== undefined) {
      return res.status(400).json({
        success: false,
        message: "Use carModelId in request body. carModel is not supported."
      });
    }

    const { serviceId, brandId, carModelId, packageName, price, features } = req.body;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "serviceId is required"
      });
    }

    if (!brandId) {
      return res.status(400).json({
        success: false,
        message: "brandId is required"
      });
    }

    if (!carModelId) {
      return res.status(400).json({
        success: false,
        message: "carModelId is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Service ID"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Brand ID"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(carModelId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Car Model ID"
      });
    }

    const serviceExists = await Service.findById(serviceId);
    if (!serviceExists) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    const brandExists = await Brand.findById(brandId);
    if (!brandExists) {
      return res.status(404).json({
        success: false,
        message: "Brand not found"
      });
    }

    const modelExists = await CarModel.findById(carModelId);
    if (!modelExists) {
      return res.status(404).json({
        success: false,
        message: "Car model not found"
      });
    }

    if (modelExists.brandId.toString() !== brandId) {
      return res.status(400).json({
        success: false,
        message: "Selected car model does not belong to the provided brand"
      });
    }

    const servicePackage = await ServicePackage.create({
      serviceName: serviceId,
      brand: brandId,
      carModel: carModelId,
      packageName,
      price,
      features
    });

    const populatedPackage = await ServicePackage.findById(servicePackage._id)
      .populate("serviceName", "name description icon")
      .populate("brand", "name logo")
      .populate("carModel", "name brandId");

    res.status(201).json({
      success: true,
      servicePackage: populatedPackage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Package creation failed"
    });
  }
};

// USER - Get Packages
export const getServicePackages = async (req, res) => {
  try {
    const serviceId = req.query.serviceId || req.params.serviceId;
    const brandId = req.query.brandId || req.params.brandId;
    const carModelId = req.query.carModelId || req.params.carModelId;

    const filters = {};

    if (serviceId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Service ID"
        });
      }
      filters.serviceName = serviceId;
    }

    if (brandId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(brandId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Brand ID"
        });
      }
      filters.brand = brandId;
    }

    if (carModelId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(carModelId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Car Model ID"
        });
      }
      filters.carModel = carModelId;
    }

    const packages = await ServicePackage.find(filters)
      .populate("serviceName", "name description icon")
      .populate("brand", "name logo")
      .populate("carModel", "name brandId");

    res.json({
      success: true,
      packages
    });
  } catch (error) {
    console.log("Error fetching packages:", error.message);
    res.status(500).json({
      message: "Failed to fetch packages"
    });
  }
};

// ADMIN - Update Package
export const updateServicePackage = async (req, res) => {
  try {
    if (req.body.serviceName !== undefined) {
      return res.status(400).json({
        success: false,
        message: "Use serviceId in request body. serviceName is not supported."
      });
    }

    if (req.body.brand !== undefined) {
      return res.status(400).json({
        success: false,
        message: "Use brandId in request body. brand is not supported."
      });
    }

    if (req.body.carModel !== undefined) {
      return res.status(400).json({
        success: false,
        message: "Use carModelId in request body. carModel is not supported."
      });
    }

    const updateData = { ...req.body };
    const serviceRef = updateData.serviceId;
    const brandRef = updateData.brandId;
    const carModelRef = updateData.carModelId;
    let existingPackage = null;

    if (brandRef !== undefined || carModelRef !== undefined) {
      existingPackage = await ServicePackage.findById(req.params.id).select("brand carModel");

      if (!existingPackage) {
        return res.status(404).json({
          success: false,
          message: "Package not found"
        });
      }
    }

    if (serviceRef !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(serviceRef)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Service ID"
        });
      }

      const serviceExists = await Service.findById(serviceRef);
      if (!serviceExists) {
        return res.status(404).json({
          success: false,
          message: "Service not found"
        });
      }

      updateData.serviceName = serviceRef;
      delete updateData.serviceId;
    }

    if (brandRef !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(brandRef)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Brand ID"
        });
      }

      const brandExists = await Brand.findById(brandRef);
      if (!brandExists) {
        return res.status(404).json({
          success: false,
          message: "Brand not found"
        });
      }

      updateData.brand = brandRef;
      delete updateData.brandId;
    }

    if (carModelRef !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(carModelRef)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Car Model ID"
        });
      }

      const modelExists = await CarModel.findById(carModelRef);
      if (!modelExists) {
        return res.status(404).json({
          success: false,
          message: "Car model not found"
        });
      }

      const targetBrandId = brandRef || existingPackage?.brand;
      if (targetBrandId && modelExists.brandId.toString() !== targetBrandId.toString()) {
        return res.status(400).json({
          success: false,
          message: "Selected car model does not belong to the provided brand"
        });
      }

      updateData.carModel = carModelRef;
      delete updateData.carModelId;
    }

    if (brandRef !== undefined && carModelRef === undefined) {
      const existingModel = await CarModel.findById(existingPackage.carModel).select("brandId");

      if (!existingModel) {
        return res.status(404).json({
          success: false,
          message: "Existing car model not found for this package"
        });
      }

      if (existingModel.brandId.toString() !== brandRef.toString()) {
        return res.status(400).json({
          success: false,
          message: "Existing car model does not belong to the provided brand"
        });
      }
    }

    const packageData = await ServicePackage.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("serviceName", "name description icon")
      .populate("brand", "name logo")
      .populate("carModel", "name brandId");

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package not found"
      });
    }

    res.json({
      success: true,
      packageData
    });
  } catch (error) {
    res.status(500).json({
      message: "Package update failed"
    });
  }
};

// ADMIN - Delete Package
export const deleteServicePackage = async (req, res) => {
  try {
    const deletedPackage = await ServicePackage.findByIdAndDelete(req.params.id);

    if (!deletedPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found"
      });
    }

    res.json({
      success: true,
      message: "Package deleted"
    });
  } catch (error) {
    res.status(500).json({
      message: "Package delete failed"
    });
  }
};
