import Product from "../models/Product.js";

// Seller adds product
export const addProduct = async (req, res) => {
  try {
    const { name, brand, category, price, stock, suitableCrops, suitableSoil } = req.body;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => file.path);
    }

    const product = await Product.create({
      seller: req.user.id,
      name,
      brand,
      category,
      price,
      stock,
      suitableCrops,
      suitableSoil,
      images: imageUrls,
      status: "pending" // Admin approval required
    });

    res.status(201).json({
      success: true,
      message: "Product added, pending admin approval",
      product
    });
  } catch (error) {
    console.error("Add Product Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Admin approves product
export const approveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    product.status = "approved";
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product approved successfully"
    });
  } catch (error) {
    console.error("Approve Product Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Farmer views approved products
export const getApprovedProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: "approved" });

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error("Get Products Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
// Seller views their own products (including pending)
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id });

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error("Get My Products Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
