import MandiPrice from "../models/MandiPrice.js";

export const getMandiPrices = async (req, res) => {
  try {
    const { crop, market } = req.query;

    // 1️⃣ Validate input
    if (!crop || !market) {
      return res.status(400).json({
        success: false,
        message: "crop and market query parameters are required"
      });
    }

    // 2️⃣ Normalize inputs
    const normalizedCrop = crop.toLowerCase().trim();
    const normalizedMarket = market.toLowerCase().trim();

    // 3️⃣ Fetch cached mandi price
    const mandiPrice = await MandiPrice.findOne({
      crop: normalizedCrop,
      market: normalizedMarket
    }).sort({ date: -1 });

    if (!mandiPrice) {
      return res.status(404).json({
        success: false,
        message: "Mandi price data not available"
      });
    }

    // 4️⃣ Send response
    res.status(200).json({
      success: true,
      crop: mandiPrice.crop,
      market: mandiPrice.market,
      prices: {
        min: mandiPrice.minPrice,
        max: mandiPrice.maxPrice,
        modal: mandiPrice.modalPrice
      },
      unit: mandiPrice.unit,
      source: mandiPrice.source,
      lastUpdated: mandiPrice.date
    });

  } catch (error) {
    console.error("Mandi Price Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to fetch mandi prices"
    });
  }
};
