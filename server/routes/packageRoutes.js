import express from "express";
import {
  getPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
  getMyPackages,
  addReview,
} from "../controllers/packageController.js";
import { protect, guideOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getPackages)
  .post(protect, guideOnly, upload.array("images", 5), createPackage);

router.get("/guide/my-packages", protect, guideOnly, getMyPackages);

router
  .route("/:id")
  .get(getPackage)
  .put(protect, guideOnly, upload.array("images", 5), updatePackage)
  .delete(protect, guideOnly, deletePackage);

router.post("/:id/reviews", protect, addReview);

export default router;
