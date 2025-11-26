import asyncHandler from "express-async-handler";
import Package from "../models/Package.js";

// @desc    Get all packages
// @route   GET /api/packages
// @access  Public
export const getPackages = asyncHandler(async (req, res) => {
  const { category, minPrice, maxPrice, location, search, sort } = req.query;

  let query = { isActive: true };

  // Filter by category
  if (category && category !== "All") {
    query.category = category;
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Filter by location
  if (location) {
    query.location = { $regex: location, $options: "i" };
  }

  // Search in title and description
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Sort options
  let sortOption = { createdAt: -1 }; // Default: newest first
  if (sort === "price_asc") sortOption = { price: 1 };
  if (sort === "price_desc") sortOption = { price: -1 };
  if (sort === "rating") sortOption = { rating: -1 };

  const packages = await Package.find(query)
    .populate("guide", "name email phone")
    .sort(sortOption);

  res.json({
    success: true,
    count: packages.length,
    data: packages,
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

  res.json({
    success: true,
    data: pkg,
  });
});

// @desc    Create new package
// @route   POST /api/packages
// @access  Private (Guide only)
export const createPackage = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    duration,
    location,
    category,
    images,
    maxGroupSize,
    difficulty,
    included,
    excluded,
  } = req.body;

  // Validation
  if (!title || !description || !price || !duration || !location || !category) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  const pkg = await Package.create({
    title,
    description,
    price,
    duration,
    location,
    category,
    images: images || [],
    maxGroupSize,
    difficulty,
    included: included || [],
    excluded: excluded || [],
    guide: req.user._id,
  });

  res.status(201).json({
    success: true,
    data: pkg,
  });
});

// @desc    Update package
// @route   PUT /api/packages/:id
// @access  Private (Guide only)
export const updatePackage = asyncHandler(async (req, res) => {
  let pkg = await Package.findById(req.params.id);

  if (!pkg) {
    res.status(404);
    throw new Error("Package not found");
  }

  // Check if user is the guide who created the package
  if (pkg.guide.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this package");
  }

  pkg = await Package.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    data: pkg,
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

  // Check if user is the guide who created the package
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

  res.json({
    success: true,
    count: packages.length,
    data: packages,
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

  // Check if user already reviewed
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
