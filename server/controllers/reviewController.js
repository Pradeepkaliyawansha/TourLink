import asyncHandler from "express-async-handler";
import Review from "../models/Review.js";
import Package from "../models/Package.js";

// Helper function to get full image URLs
const getImageUrls = (images, req) => {
  if (!images || images.length === 0) return [];
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return images.map((image) => {
    if (image.startsWith("http")) return image;
    return `${baseUrl}${image}`;
  });
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
  const { packageId, rating, title, comment } = req.body;

  if (!packageId || !rating || !title || !comment) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  // Check if package exists
  const pkg = await Package.findById(packageId);
  if (!pkg) {
    res.status(404);
    throw new Error("Package not found");
  }

  // Check if user already reviewed this package
  const existingReview = await Review.findOne({
    package: packageId,
    user: req.user._id,
  });

  if (existingReview) {
    res.status(400);
    throw new Error("You have already reviewed this package");
  }

  // Store relative paths for photos
  const photos = req.files
    ? req.files.map((file) => `/uploads/reviews/${file.filename}`)
    : [];

  // Create review
  const review = await Review.create({
    package: packageId,
    user: req.user._id,
    rating: Number(rating),
    title: title.trim(),
    comment: comment.trim(),
    photos,
    isVerifiedBooking: false, // Can be implemented with booking system
  });

  // Update package rating
  await updatePackageRating(packageId);

  // Populate user info
  await review.populate("user", "name avatar");

  const reviewObj = review.toObject();
  reviewObj.photos = getImageUrls(reviewObj.photos, req);

  res.status(201).json({
    success: true,
    data: reviewObj,
  });
});

// @desc    Get reviews for a package
// @route   GET /api/reviews/:packageId
// @access  Public
export const getPackageReviews = asyncHandler(async (req, res) => {
  const { packageId } = req.params;
  const { rating, sort = "-createdAt", page = 1, limit = 10 } = req.query;

  // Build query
  const query = {
    package: packageId,
    moderationStatus: "approved",
  };

  if (rating) {
    query.rating = Number(rating);
  }

  // Sorting options
  let sortOption = {};
  switch (sort) {
    case "recent":
      sortOption = { createdAt: -1 };
      break;
    case "highest":
      sortOption = { rating: -1, createdAt: -1 };
      break;
    case "lowest":
      sortOption = { rating: 1, createdAt: -1 };
      break;
    case "helpful":
      sortOption = { helpfulVotes: -1, createdAt: -1 };
      break;
    default:
      sortOption = { createdAt: -1 };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const reviews = await Review.find(query)
    .populate("user", "name avatar")
    .populate("guideReply.repliedBy", "name avatar")
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));

  const total = await Review.countDocuments(query);

  // Transform photos to full URLs
  const reviewsWithFullUrls = reviews.map((review) => {
    const reviewObj = review.toObject();
    reviewObj.photos = getImageUrls(reviewObj.photos, req);
    return reviewObj;
  });

  res.json({
    success: true,
    count: reviewsWithFullUrls.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: reviewsWithFullUrls,
  });
});

// @desc    Get review statistics for a package
// @route   GET /api/reviews/:packageId/stats
// @access  Public
export const getReviewStats = asyncHandler(async (req, res) => {
  const { packageId } = req.params;

  const reviews = await Review.find({
    package: packageId,
    moderationStatus: "approved",
  });

  const stats = {
    totalReviews: reviews.length,
    averageRating: 0,
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
    verifiedBookings: 0,
    withPhotos: 0,
    withGuideReply: 0,
  };

  if (reviews.length > 0) {
    let totalRating = 0;
    reviews.forEach((review) => {
      totalRating += review.rating;
      stats.ratingDistribution[review.rating]++;
      if (review.isVerifiedBooking) stats.verifiedBookings++;
      if (review.photos.length > 0) stats.withPhotos++;
      if (review.guideReply?.message) stats.withGuideReply++;
    });

    stats.averageRating = (totalRating / reviews.length).toFixed(1);

    // Convert to percentages
    Object.keys(stats.ratingDistribution).forEach((key) => {
      stats.ratingDistribution[key] = Math.round(
        (stats.ratingDistribution[key] / reviews.length) * 100
      );
    });
  }

  res.json({
    success: true,
    data: stats,
  });
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  if (review.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this review");
  }

  const { rating, title, comment } = req.body;

  // Save edit history
  if (rating || comment) {
    review.editHistory.push({
      editedAt: new Date(),
      previousComment: review.comment,
      previousRating: review.rating,
    });
    review.isEdited = true;
  }

  if (rating) review.rating = Number(rating);
  if (title) review.title = title.trim();
  if (comment) review.comment = comment.trim();

  // Handle new photos
  if (req.files && req.files.length > 0) {
    const newPhotos = req.files.map(
      (file) => `/uploads/reviews/${file.filename}`
    );
    review.photos = [...review.photos, ...newPhotos].slice(0, 5); // Max 5 photos
  }

  await review.save();

  // Update package rating
  await updatePackageRating(review.package);

  await review.populate("user", "name avatar");

  const reviewObj = review.toObject();
  reviewObj.photos = getImageUrls(reviewObj.photos, req);

  res.json({
    success: true,
    data: reviewObj,
  });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  if (review.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to delete this review");
  }

  const packageId = review.package;
  await review.deleteOne();

  // Update package rating
  await updatePackageRating(packageId);

  res.json({
    success: true,
    message: "Review deleted successfully",
  });
});

// @desc    Vote on a review (helpful/unhelpful)
// @route   POST /api/reviews/:id/vote
// @access  Private
export const voteOnReview = asyncHandler(async (req, res) => {
  const { voteType } = req.body; // 'helpful' or 'unhelpful'
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  if (!["helpful", "unhelpful"].includes(voteType)) {
    res.status(400);
    throw new Error("Invalid vote type");
  }

  const userId = req.user._id;

  // Remove any existing votes from this user
  review.helpfulVotes = review.helpfulVotes.filter(
    (vote) => vote.user.toString() !== userId.toString()
  );
  review.unhelpfulVotes = review.unhelpfulVotes.filter(
    (vote) => vote.user.toString() !== userId.toString()
  );

  // Add new vote
  if (voteType === "helpful") {
    review.helpfulVotes.push({ user: userId });
  } else {
    review.unhelpfulVotes.push({ user: userId });
  }

  await review.save();

  res.json({
    success: true,
    data: {
      helpfulCount: review.helpfulVotes.length,
      unhelpfulCount: review.unhelpfulVotes.length,
    },
  });
});

// @desc    Add guide reply to a review
// @route   POST /api/reviews/:id/reply
// @access  Private (Guide only)
export const addGuideReply = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const review = await Review.findById(req.params.id).populate(
    "package",
    "guide"
  );

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  // Check if user is the guide of this package
  if (review.package.guide.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only the package guide can reply to reviews");
  }

  if (!message || message.trim().length === 0) {
    res.status(400);
    throw new Error("Please provide a reply message");
  }

  review.guideReply = {
    message: message.trim(),
    repliedAt: new Date(),
    repliedBy: req.user._id,
  };

  await review.save();
  await review.populate("guideReply.repliedBy", "name avatar");

  res.json({
    success: true,
    data: review.guideReply,
  });
});

// @desc    Get all reviews (Admin only - for moderation)
// @route   GET /api/reviews/admin/all
// @access  Private/Admin
export const getAllReviews = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) {
    query.moderationStatus = status;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const reviews = await Review.find(query)
    .populate("user", "name email avatar")
    .populate("package", "title")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Review.countDocuments(query);

  res.json({
    success: true,
    count: reviews.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: reviews,
  });
});

// @desc    Moderate review (Admin only)
// @route   PUT /api/reviews/:id/moderate
// @access  Private/Admin
export const moderateReview = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  if (!["approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Invalid moderation status");
  }

  review.moderationStatus = status;
  review.isModerated = true;
  if (note) review.moderationNote = note;

  await review.save();

  // Update package rating if status changed
  if (status === "approved") {
    await updatePackageRating(review.package);
  }

  res.json({
    success: true,
    data: review,
  });
});

// @desc    Get guide's response rate
// @route   GET /api/reviews/guide/:guideId/response-rate
// @access  Public
export const getGuideResponseRate = asyncHandler(async (req, res) => {
  const { guideId } = req.params;

  // Get all packages by this guide
  const packages = await Package.find({ guide: guideId }).select("_id");
  const packageIds = packages.map((pkg) => pkg._id);

  // Get all reviews for these packages
  const totalReviews = await Review.countDocuments({
    package: { $in: packageIds },
    moderationStatus: "approved",
  });

  const reviewsWithReply = await Review.countDocuments({
    package: { $in: packageIds },
    moderationStatus: "approved",
    "guideReply.message": { $exists: true },
  });

  const responseRate =
    totalReviews > 0 ? ((reviewsWithReply / totalReviews) * 100).toFixed(1) : 0;

  res.json({
    success: true,
    data: {
      totalReviews,
      reviewsWithReply,
      responseRate: Number(responseRate),
    },
  });
});

// Helper function to update package rating
const updatePackageRating = async (packageId) => {
  const reviews = await Review.find({
    package: packageId,
    moderationStatus: "approved",
  });

  if (reviews.length === 0) {
    await Package.findByIdAndUpdate(packageId, {
      rating: 0,
      reviews: [],
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await Package.findByIdAndUpdate(packageId, {
    rating: averageRating,
  });
};

export default {
  createReview,
  getPackageReviews,
  getReviewStats,
  updateReview,
  deleteReview,
  voteOnReview,
  addGuideReply,
  getAllReviews,
  moderateReview,
  getGuideResponseRate,
};
