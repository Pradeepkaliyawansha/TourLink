import express from "express";
import {
  createBooking,
  getMyBookings,
  getGuideBookings,
  getBooking,
  updateBookingStatus,
  updatePaymentStatus,
  cancelBooking,
  checkAvailability,
  getBookingCalendar,
  addGuideNotes,
  getBookingStatistics,
} from "../controllers/bookingController.js";
import { protect, guideOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/availability/:packageId", checkAvailability);

// Protected routes
router.post("/", protect, createBooking);
router.get("/my-bookings", protect, getMyBookings);
router.get("/:id", protect, getBooking);
router.put("/:id/cancel", protect, cancelBooking);
router.put("/:id/payment", protect, updatePaymentStatus);

// Guide routes
router.get("/guide/bookings", protect, guideOnly, getGuideBookings);
router.get("/guide/calendar", protect, guideOnly, getBookingCalendar);
router.get("/guide/statistics", protect, guideOnly, getBookingStatistics);
router.put("/:id/status", protect, guideOnly, updateBookingStatus);
router.put("/:id/notes", protect, guideOnly, addGuideNotes);

export default router;
