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

const router = express.Router();

router.route("/").get(getPackages).post(protect, guideOnly, createPackage);

router.get("/guide/my-packages", protect, guideOnly, getMyPackages);

router
  .route("/:id")
  .get(getPackage)
  .put(protect, guideOnly, updatePackage)
  .delete(protect, guideOnly, deletePackage);

router.post("/:id/reviews", protect, addReview);

export default router;
