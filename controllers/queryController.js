import Query from "../models/Query.js";

// CUSTOMER - Create Query
export const createQuery = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const {
      name,
      email,
      phone,
      location,
      service,
      message
    } = req.body;

    const requiredFields = {
      name,
      email,
      phone,
      location,
      service,
      message
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

    const query = await Query.create({
      userId: req.user._id,
      name,
      email,
      phone,
      location,
      service,
      message
    });

    return res.status(201).json({
      success: true,
      message: "Query submitted successfully",
      query
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit query"
    });
  }
};

// ADMIN - Get All Queries
export const getQueryList = async (_req, res) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      queries
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch queries"
    });
  }
};

// ADMIN - Update Query Status
export const updateQueryStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!String(status || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    const query = await Query.findByIdAndUpdate(
      req.params.id,
      { status: status.trim() },
      { new: true, runValidators: true }
    );

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found"
      });
    }

    return res.json({
      success: true,
      message: "Query status updated successfully",
      query
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update query status"
    });
  }
};

// ADMIN - Delete Query
export const deleteQuery = async (req, res) => {
  try {
    const query = await Query.findByIdAndDelete(req.params.id);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found"
      });
    }

    return res.json({
      success: true,
      message: "Query deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete query"
    });
  }
};
