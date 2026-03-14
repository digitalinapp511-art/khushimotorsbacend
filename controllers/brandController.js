import Brand from "../models/Brand.js";

// ADMIN - Add Brand

export const createBrand = async (req, res) => {
  try {

    const { name, logo } = req.body;

    const brand = await Brand.create({
      name,
      logo
    });

    res.status(201).json({
      success: true,
      brand
    });

  } catch (error) {

    res.status(500).json({
      message: "Brand creation failed"
    });

  }
};


// USER - Get Brands

export const getBrands = async (req, res) => {
  try {

    const brands = await Brand.find();

    res.json({
      success: true,
      brands
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch brands"
    });

  }
};


// ADMIN - Update Brand

export const updateBrand = async (req, res) => {

  try {

    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      brand
    });

  } catch (error) {

    res.status(500).json({
      message: "Brand update failed"
    });

  }
};


// ADMIN - Delete Brand

export const deleteBrand = async (req, res) => {

  try {

    await Brand.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Brand deleted"
    });

  } catch (error) {

    res.status(500).json({
      message: "Brand delete failed"
    });

  }
};