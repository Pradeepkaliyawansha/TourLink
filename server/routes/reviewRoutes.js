import express from "express";
import {
  createReview,
  getPackageReviews,
  getReviewStats,
  updateReview,
  deleteReview,
  voteOnReview,
  addGuideReply,
  deleteGuideReply,
  getAllReviews,
  moderateReview,
  getGuideResponseRate,
} from "../controllers/reviewController.js";
import { protect, adminOnly, guideOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public routes
router.get("/:packageId", getPackageReviews);
router.get("/:packageId/stats", getReviewStats);
router.get("/guide/:guideId/response-rate", getGuideResponseRate);

// Protected routes
router.post("/", protect, upload.array("photos", 5), createReview);
router.put("/:id", protect, upload.array("photos", 5), updateReview);
router.delete("/:id", protect, deleteReview);
router.post("/:id/vote", protect, voteOnReview);

// Guide routes
router.post("/:id/reply", protect, guideOnly, addGuideReply);
router.delete("/:id/reply", protect, guideOnly, deleteGuideReply); // Add this line

// Admin routes
router.get("/admin/all", protect, adminOnly, getAllReviews);
router.put("/:id/moderate", protect, adminOnly, moderateReview);

export default router;
