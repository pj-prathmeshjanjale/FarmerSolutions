import SellerProfile from "../models/SellerProfile.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Equipment from "../models/Equipment.js";

// @desc    Get sellers by status (pending, approved, rejected)
// @route   GET /api/admin/sellers?status=pending
// @access  Private/Admin
export const getSellers = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { verificationStatus: status } : {};

        const sellers = await SellerProfile.find(query).populate("user", "name email");
        res.status(200).json({ success: true, count: sellers.length, data: sellers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update seller status (approve/reject)
// @route   PUT /api/admin/seller-status/:id
export const updateSellerStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        const seller = await SellerProfile.findById(req.params.id);

        if (!seller) {
            return res.status(404).json({ success: false, message: "Seller profile not found" });
        }

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        seller.verificationStatus = status;
        await seller.save();

        // Also update the User model verificationStatus if needed, or rely on SellerProfile
        const user = await User.findById(seller.user);
        if (user) {
            user.verificationStatus = status;
            await user.save();
        }

        res.status(200).json({ success: true, message: `Seller ${status}` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get products by status
// @route   GET /api/admin/products?status=pending
export const getProducts = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status: status } : {}; // Product uses 'status' field

        const products = await Product.find(query).populate("seller", "name email");
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update product status
// @route   PUT /api/admin/product-status/:id
export const updateProductStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        product.status = status;
        await product.save();

        res.status(200).json({ success: true, message: `Product ${status} successfully` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all pending equipment (Legacy/Unchanged for now or update if needed)
// @route   GET /api/admin/pending-equipment
export const getPendingEquipment = async (req, res) => {
    try {
        const pendingEquipment = await Equipment.find({ approved: false }).populate("owner", "name email");
        res.status(200).json({ success: true, count: pendingEquipment.length, data: pendingEquipment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Approve equipment
// @route   PUT /api/admin/approve-equipment/:id
export const approveEquipmentAction = async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id);

        if (!equipment) {
            return res.status(404).json({ success: false, message: "Equipment not found" });
        }

        equipment.approved = true;
        await equipment.save();

        res.status(200).json({ success: true, message: "Equipment approved successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
