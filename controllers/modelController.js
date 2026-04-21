import CarModel from "../models/CarModel.js";


// ADMIN - Add Model

export const createModel = async (req, res) => {

  try {

    const { brandId, name, image, icon } = req.body;

    const model = await CarModel.create({
      brandId,
      name,
      image: image || "",
      icon: icon || ""
    });

    res.status(201).json({
      success: true,
      model
    });

  } catch (error) {

    res.status(500).json({
      message: "Model creation failed"
    });

  }
};


// USER - Get Models by Brand

export const getModelsByBrand = async (req, res) => {

  try {

    const models = await CarModel.find({
      brandId: req.params.brandId
    });

    res.json({
      success: true,
      models
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch models"
    });

  }
};


// ADMIN - Update Model

export const updateModel = async (req, res) => {

  try {

    const model = await CarModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      model
    });

  } catch (error) {

    res.status(500).json({
      message: "Model update failed"
    });

  }
};


// ADMIN - Delete Model

export const deleteModel = async (req, res) => {

  try {

    await CarModel.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Model deleted"
    });

  } catch (error) {

    res.status(500).json({
      message: "Model delete failed"
    });

  }
};