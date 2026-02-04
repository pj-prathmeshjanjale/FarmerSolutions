import Land from "../models/Land.js";

export const addLand = async (req, res) => {
  try {
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        success: false,
        message: "Only farmers can add land"
      });
    }

    const land = await Land.create({
      farmer: req.user.id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      message: "Land added successfully",
      land
    });

  } catch (error) {
    console.error("Add Land Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const getMyLands = async (req, res) => {
  try {
    const lands = await Land.find({ farmer: req.user.id });

    res.status(200).json({
      success: true,
      count: lands.length,
      lands
    });
  } catch (error) {
    console.error("Get Lands Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
