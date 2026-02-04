import Land from "../models/Land.js";
import Product from "../models/Product.js";

export const getRecommendedProducts = async (req, res) => {
  try {
    // 1️⃣ Get all lands of the logged-in farmer
    const lands = await Land.find({ farmer: req.user.id });

    if (lands.length === 0) {
      return res.status(200).json({
        success: true,
        recommendedProducts: [],
        message: "No land data found for recommendations"
      });
    }

    // 2️⃣ Extract crops and soil types from lands
    const crops = new Set();
    const soils = new Set();

    lands.forEach((land) => {
      if (land.crop) crops.add(land.crop.toLowerCase());
      if (land.soilType) soils.add(land.soilType.toLowerCase());
    });

    // 3️⃣ Fetch all approved products
    const products = await Product.find({ approved: true });

    // 4️⃣ Match products based on crop & soil
    const recommendations = [];

    products.forEach((product) => {
      let matchReason = [];

      // Normalize product data
      const productCrops = product.suitableCrops.map(c => c.toLowerCase());
      const productSoils = product.suitableSoil.map(s => s.toLowerCase());

      // Crop match
      const cropMatch = productCrops.some(crop => crops.has(crop));
      if (cropMatch) matchReason.push("crop");

      // Soil match
      const soilMatch = productSoils.some(soil => soils.has(soil));
      if (soilMatch) matchReason.push("soil");

      // If any match found, recommend product
      if (matchReason.length > 0) {
        recommendations.push({
          _id: product._id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          price: product.price,
          matchReason
        });
      }
    });

    // 5️⃣ Send response
    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendedProducts: recommendations
    });

  } catch (error) {
    console.error("Recommendation Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
