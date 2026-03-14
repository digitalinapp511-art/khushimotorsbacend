import ServicePackage from "../models/ServicePackage.js";


// ADMIN - Add Package

export const createServicePackage = async (req, res) => {

  try {

    const { serviceName, packageName, price, features } = req.body;

    const servicePackage = await ServicePackage.create({
      serviceName,
      packageName,
      price,
      features
    });

    res.status(201).json({
      success: true,
      servicePackage
    });

  } catch (error) {

    res.status(500).json({
      message: "Package creation failed"
    });

  }
};


// USER - Get Packages

export const getServicePackages = async (req, res) => {

  try {

    const packages = await ServicePackage.find();

    res.json({
      success: true,
      packages
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch packages"
    });

  }
};


// ADMIN - Update Package

export const updateServicePackage = async (req, res) => {

  try {

    const packageData = await ServicePackage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

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

    await ServicePackage.findByIdAndDelete(req.params.id);

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