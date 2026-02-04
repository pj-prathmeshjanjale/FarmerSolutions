import Equipment from "../models/Equipment.js";

// Create equipment listing
export const createEquipment = async (req, res) => {
  try {
    // Check if files were uploaded
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => file.path); // Cloudinary returns URL in 'path'
    } else if (req.body.images) {
      // Handle legacy/fallback manual URL entry if needed, or just ignore
      // For now, ensuring we use the uploaded ones if available
      if (Array.isArray(req.body.images)) imageUrls = req.body.images;
      else imageUrls = [req.body.images];
    }

    const equipment = await Equipment.create({
      owner: req.user.id,
      ...req.body,
      images: imageUrls // Save the URLs
    });

    res.status(201).json({
      success: true,
      equipment
    });
  } catch (error) {
    console.error("Create Equipment Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message, // detailed error
      stack: error.stack // debugging info
    });
  }
};
// Get single equipment by ID
export const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findById(id)
      .populate("owner", "name");

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found"
      });
    }

    res.status(200).json({
      success: true,
      equipment
    });

  } catch (error) {
    console.error("Get Equipment By ID Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to fetch equipment"
    });
  }
};

// Get equipment listed by logged-in farmer
export const getMyEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find({
      owner: req.user.id
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      equipment
    });

  } catch (error) {
    console.error("Get My Equipment Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to fetch your equipment"
    });
  }
};


// Get all available equipment
export const getAllEquipment = async (req, res) => {
  try {
    const equipmentList = await Equipment.find({ availability: true, approved: true })
      .populate("owner", "name");

    res.status(200).json({
      success: true,
      equipment: equipmentList
    });
  } catch (error) {
    console.error("Get Equipment Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to fetch equipment"
    });
  }
};
// Delete equipment (only by owner)
export const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findById(id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found"
      });
    }

    // Verify ownership
    if (equipment.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this equipment"
      });
    }

    await Equipment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Equipment deleted successfully"
    });

  } catch (error) {
    console.error("Delete Equipment Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to delete equipment"
    });
  }
};
