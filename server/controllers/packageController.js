import asyncHandler from "express-async-handler";
import Package from "../models/Package.js";

// Helper function to get full image URLs
const getImageUrls = (images, req) => {
  if (!images || images.length === 0) return [];

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return images.map((image) => {
    // If image already has full URL, return as is
    if (image.startsWith("http")) return image;
    // Otherwise, construct full URL
    return `${baseUrl}${image}`;
  });
};

// @desc    Get all packages
// @route   GET /api/packages
// @access  Public
export const getPackages = asyncHandler(async (req, res) => {
  const { category, minPrice, maxPrice, location, search, sort } = req.query;

  let query = { isActive: true };

  if (category && category !== "All") {
    query.category = category;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (location) {
    query.location = { $regex: location, $options: "i" };
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  let sortOption = { createdAt: -1 };
  if (sort === "price_asc") sortOption = { price: 1 };
  if (sort === "price_desc") sortOption = { price: -1 };
  if (sort === "rating") sortOption = { rating: -1 };

  const packages = await Package.find(query)
    .populate("guide", "name email phone")
    .sort(sortOption);

  // Transform images to full URLs
  const packagesWithFullUrls = packages.map((pkg) => {
    const pkgObj = pkg.toObject();
    pkgObj.images = getImageUrls(pkgObj.images, req);
    return pkgObj;
  });

  res.json({
    success: true,
    count: packagesWithFullUrls.length,
    data: packagesWithFullUrls,
  });
});

// @desc    Get single package
// @route   GET /api/packages/:id
// @access  Public
export const getPackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id)
    .populate("guide", "name email phone avatar")
    .populate("reviews.user", "name avatar");

  if (!pkg) {
    res.status(404);
    throw new Error("Package not found");
  }

  const pkgObj = pkg.toObject();
  pkgObj.images = getImageUrls(pkgObj.images, req);

  res.json({
    success: true,
    data: pkgObj,
  });
});

// @desc    Create new package
// @route   POST /api/packages
// @access  Private (Guide only)
export const createPackage = asyncHandler(async (req, res) => {
  console.log("📦 Create Package Request Body:", req.body);
  console.log("📁 Uploaded Files:", req.files);

  const {
    title,
    description,
    price,
    duration,
    location,
    category,
    maxGroupSize,
    difficulty,
  } = req.body;

  if (!title || !description || !price || !duration || !location || !category) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  let included = [];
  let excluded = [];

  if (req.body.included) {
    try {
      included = JSON.parse(req.body.included);
    } catch {
      included = req.body.included.split(",").map((item) => item.trim());
    }
  } else if (req.body["included[]"]) {
    included = Array.isArray(req.body["included[]"])
      ? req.body["included[]"]
      : [req.body["included[]"]];
  }

  if (req.body.excluded) {
    try {
      excluded = JSON.parse(req.body.excluded);
    } catch {
      excluded = req.body.excluded.split(",").map((item) => item.trim());
    }
  } else if (req.body["excluded[]"]) {
    excluded = Array.isArray(req.body["excluded[]"])
      ? req.body["excluded[]"]
      : [req.body["excluded[]"]];
  }

  included = included.filter((item) => item && item.trim());
  excluded = excluded.filter((item) => item && item.trim());

  // Store relative paths in database
  const images = req.files
    ? req.files.map((file) => `/uploads/packages/${file.filename}`)
    : [];

  console.log("✅ Processed Data - Images:", images);

  const pkg = await Package.create({
    title,
    description,
    price: Number(price),
    duration,
    location,
    category,
    images,
    maxGroupSize: Number(maxGroupSize) || 10,
    difficulty: difficulty || "Moderate",
    included,
    excluded,
    guide: req.user._id,
  });

  // Return with full URLs
  const pkgObj = pkg.toObject();
  pkgObj.images = getImageUrls(pkgObj.images, req);

  res.status(201).json({
    success: true,
    data: pkgObj,
  });
});

// @desc    Update package
// @route   PUT /api/packages/:id
// @access  Private (Guide only)
export const updatePackage = asyncHandler(async (req, res) => {
  console.log("📦 Update Package Request Body:", req.body);
  console.log("📁 Uploaded Files:", req.files);

  let pkg = await Package.findById(req.params.id);

  if (!pkg) {
    res.status(404);
    throw new Error("Package not found");
  }

  if (pkg.guide.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this package");
  }

  const updateData = {};

  if (req.body.title) updateData.title = req.body.title;
  if (req.body.description) updateData.description = req.body.description;
  if (req.body.price) updateData.price = Number(req.body.price);
  if (req.body.duration) updateData.duration = req.body.duration;
  if (req.body.location) updateData.location = req.body.location;
  if (req.body.category) updateData.category = req.body.category;
  if (req.body.maxGroupSize)
    updateData.maxGroupSize = Number(req.body.maxGroupSize);
  if (req.body.difficulty) updateData.difficulty = req.body.difficulty;

  let included = [];
  if (req.body.included) {
    try {
      included = JSON.parse(req.body.included);
    } catch {
      included = req.body.included.split(",").map((item) => item.trim());
    }
  } else if (req.body["included[]"]) {
    included = Array.isArray(req.body["included[]"])
      ? req.body["included[]"]
      : [req.body["included[]"]];
  }
  if (included.length > 0) {
    updateData.included = included.filter((item) => item && item.trim());
  }

  let excluded = [];
  if (req.body.excluded) {
    try {
      excluded = JSON.parse(req.body.excluded);
    } catch {
      excluded = req.body.excluded.split(",").map((item) => item.trim());
    }
  } else if (req.body["excluded[]"]) {
    excluded = Array.isArray(req.body["excluded[]"])
      ? req.body["excluded[]"]
      : [req.body["excluded[]"]];
  }
  if (excluded.length > 0) {
    updateData.excluded = excluded.filter((item) => item && item.trim());
  }

  // Handle images - strip domain if present, keep relative paths only
  let images = [];

  if (req.body.existingImages) {
    const existingImages = Array.isArray(req.body.existingImages)
      ? req.body.existingImages
      : req.body["existingImages[]"]
      ? Array.isArray(req.body["existingImages[]"])
        ? req.body["existingImages[]"]
        : [req.body["existingImages[]"]]
      : [];

    // Strip domain from existing images, keep only path
    images = existingImages.map((img) => {
      if (img.startsWith("http")) {
        const url = new URL(img);
        return url.pathname;
      }
      return img;
    });
  }

  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(
      (file) => `/uploads/packages/${file.filename}`
    );
    images = [...images, ...newImages];
  }

  if (images.length > 0) {
    updateData.images = images.slice(0, 5);
  }

  console.log("✅ Update Data - Images:", updateData.images);

  pkg = await Package.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  // Return with full URLs
  const pkgObj = pkg.toObject();
  pkgObj.images = getImageUrls(pkgObj.images, req);

  res.json({
    success: true,
    data: pkgObj,
  });
});

// @desc    Delete package
// @route   DELETE /api/packages/:id
// @access  Private (Guide only)
export const deletePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);

  if (!pkg) {
    res.status(404);
    throw new Error("Package not found");
  }

  if (pkg.guide.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to delete this package");
  }

  await pkg.deleteOne();

  res.json({
    success: true,
    message: "Package deleted successfully",
  });
});

// @desc    Get packages by guide
// @route   GET /api/packages/guide/my-packages
// @access  Private (Guide only)
export const getMyPackages = asyncHandler(async (req, res) => {
  const packages = await Package.find({ guide: req.user._id }).sort({
    createdAt: -1,
  });

  const packagesWithFullUrls = packages.map((pkg) => {
    const pkgObj = pkg.toObject();
    pkgObj.images = getImageUrls(pkgObj.images, req);
    return pkgObj;
  });

  res.json({
    success: true,
    count: packagesWithFullUrls.length,
    data: packagesWithFullUrls,
  });
});

// @desc    Add review to package
// @route   POST /api/packages/:id/reviews
// @access  Private
export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const pkg = await Package.findById(req.params.id);

  if (!pkg) {
    res.status(404);
    throw new Error("Package not found");
  }

  const alreadyReviewed = pkg.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error("Package already reviewed");
  }

  const review = {
    user: req.user._id,
    rating: Number(rating),
    comment,
  };

  pkg.reviews.push(review);
  pkg.rating =
    pkg.reviews.reduce((acc, item) => item.rating + acc, 0) /
    pkg.reviews.length;

  await pkg.save();

  res.status(201).json({
    success: true,
    message: "Review added successfully",
  });
});
