import Service from "../models/Service.js";


// ADMIN - Create Service

export const createService = async (req, res) => {

  try {
    const { name, description, icon } = req.body;

    const service = await Service.create({
      name,
      description,
      icon
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Service creation failed"
    });

  }

};



// USER - Get All Services

export const getServices = async (req, res) => {

  try {

    const services = await Service.find();

    res.json({
      success: true,
      services
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Failed to fetch services"
    });

  }

};



// USER - Get Single Service

export const getSingleService = async (req, res) => {

  try {

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Service not found"
      });
    }

    res.json({
      success: true,
      service
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch service"
    });

  }

};



// ADMIN - Update Service

export const updateService = async (req, res) => {

  try {

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      message: "Service updated",
      service
    });

  } catch (error) {

    res.status(500).json({
      message: "Service update failed"
    });

  }

};



// ADMIN - Delete Service

export const deleteService = async (req, res) => {

  try {

    await Service.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Service deleted"
    });

  } catch (error) {

    res.status(500).json({
      message: "Service delete failed"
    });

  }

};