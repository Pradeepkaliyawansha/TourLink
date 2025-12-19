import asyncHandler from "express-async-handler";
import Booking from "../models/Booking.js";
import Package from "../models/Package.js";
import User from "../models/User.js";
import { notificationService } from "../sockets/chatSocket.js";

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Tourist only)
export const createBooking = asyncHandler(async (req, res) => {
  const {
    packageId,
    bookingDate,
    numberOfTravelers,
    travelers,
    specialRequests,
    emergencyContact,
    paymentMethod,
  } = req.body;

  // Validation
  if (!packageId || !bookingDate || !numberOfTravelers || !travelers) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  // Get package details
  const pkg = await Package.findById(packageId).populate("guide", "name email");
  if (!pkg) {
    res.status(404);
    throw new Error("Package not found");
  }

  // Check availability
  const availability = await Booking.checkAvailability(
    packageId,
    bookingDate,
    numberOfTravelers
  );

  if (!availability.available) {
    res.status(400);
    throw new Error(
      `Not enough spots available. Only ${availability.availableSpots} spots left.`
    );
  }

  // Calculate total amount
  const totalAmount = pkg.price * numberOfTravelers;

  // Create booking
  const booking = await Booking.create({
    package: packageId,
    tourist: req.user._id,
    guide: pkg.guide._id,
    bookingDate,
    numberOfTravelers,
    travelers,
    totalAmount,
    specialRequests,
    emergencyContact,
    paymentMethod,
    contactInfo: {
      email: req.user.email,
      phone: req.user.phone || "",
    },
  });

  // Populate references
  await booking.populate([
    { path: "package", select: "title location duration images price" },
    { path: "tourist", select: "name email phone" },
    { path: "guide", select: "name email phone" },
  ]);

  // Send notification to guide
  if (notificationService) {
    await notificationService.sendNotification({
      recipientId: pkg.guide._id,
      senderId: req.user._id,
      type: "booking_request",
      title: "New Booking Request",
      message: `${req.user.name} has requested to book "${pkg.title}" for ${numberOfTravelers} travelers`,
      data: {
        packageId: pkg._id,
        bookingId: booking._id,
        actionUrl: `/bookings/${booking._id}`,
      },
      priority: "high",
    });
  }

  res.status(201).json({
    success: true,
    data: booking,
    message: "Booking created successfully. Awaiting guide confirmation.",
  });
});

// @desc    Get my bookings (Tourist)
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getMyBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const query = { tourist: req.user._id };

  if (status && status !== "all") {
    query.status = status;
  }

  const bookings = await Booking.find(query)
    .populate({
      path: "package",
      select: "title location duration images price",
    })
    .populate("guide", "name email phone")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

// @desc    Get guide's bookings
// @route   GET /api/bookings/guide/bookings
// @access  Private (Guide only)
export const getGuideBookings = asyncHandler(async (req, res) => {
  const { status, date, page = 1, limit = 20 } = req.query;

  const query = { guide: req.user._id };

  if (status && status !== "all") {
    query.status = status;
  }

  if (date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    query.bookingDate = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const bookings = await Booking.find(query)
    .populate({
      path: "package",
      select: "title location duration images price",
    })
    .populate("tourist", "name email phone")
    .sort({ bookingDate: 1, createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Booking.countDocuments(query);

  res.json({
    success: true,
    count: bookings.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: bookings,
  });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate({
      path: "package",
      select: "title description location duration images price maxGroupSize",
    })
    .populate("tourist", "name email phone avatar")
    .populate("guide", "name email phone avatar");

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  // Check authorization
  const isTourist = booking.tourist._id.toString() === req.user._id.toString();
  const isGuide = booking.guide._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isTourist && !isGuide && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized to access this booking");
  }

  res.json({
    success: true,
    data: booking,
  });
});

// @desc    Update booking status (Guide only)
// @route   PUT /api/bookings/:id/status
// @access  Private (Guide only)
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  if (!["Pending", "Confirmed", "Completed", "Cancelled"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const booking = await Booking.findById(req.params.id).populate([
    { path: "package", select: "title" },
    { path: "tourist", select: "name" },
  ]);

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  // Check if user is the guide
  if (booking.guide.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this booking");
  }

  booking.status = status;
  if (note) {
    booking.guideNotes = note;
  }

  await booking.save();

  // Send notification to tourist
  if (notificationService) {
    let notificationMessage = "";
    let notificationType = "booking_confirmation";

    switch (status) {
      case "Confirmed":
        notificationMessage = `Your booking for "${booking.package.title}" has been confirmed!`;
        break;
      case "Completed":
        notificationMessage = `Your tour "${booking.package.title}" has been completed. Please leave a review!`;
        notificationType = "booking_confirmation";
        break;
      case "Cancelled":
        notificationMessage = `Your booking for "${booking.package.title}" has been cancelled by the guide.`;
        break;
    }

    await notificationService.sendNotification({
      recipientId: booking.tourist._id,
      senderId: req.user._id,
      type: notificationType,
      title: "Booking Status Updated",
      message: notificationMessage,
      data: {
        packageId: booking.package._id,
        bookingId: booking._id,
        actionUrl: `/bookings/${booking._id}`,
      },
      priority: "high",
    });
  }

  res.json({
    success: true,
    data: booking,
    message: `Booking status updated to ${status}`,
  });
});

// @desc    Update payment status
// @route   PUT /api/bookings/:id/payment
// @access  Private
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus, transactionId } = req.body;

  if (!["Pending", "Paid", "Refunded", "Failed"].includes(paymentStatus)) {
    res.status(400);
    throw new Error("Invalid payment status");
  }

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  // Check authorization
  const isTourist = booking.tourist.toString() === req.user._id.toString();
  const isGuide = booking.guide.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isTourist && !isGuide && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized to update this booking");
  }

  booking.paymentStatus = paymentStatus;

  if (transactionId) {
    booking.paymentDetails = booking.paymentDetails || {};
    booking.paymentDetails.transactionId = transactionId;
  }

  if (paymentStatus === "Paid") {
    booking.paymentDetails = booking.paymentDetails || {};
    booking.paymentDetails.paidAt = new Date();
  }

  await booking.save();

  res.json({
    success: true,
    data: booking,
    message: "Payment status updated successfully",
  });
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const booking = await Booking.findById(req.params.id).populate([
    { path: "package", select: "title" },
    { path: "guide", select: "name" },
  ]);

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  // Check if user is the tourist
  if (booking.tourist.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to cancel this booking");
  }

  // Check if booking can be cancelled
  if (!booking.canCancel) {
    res.status(400);
    throw new Error(
      "Booking cannot be cancelled within 48 hours of the tour date"
    );
  }

  if (booking.status === "Cancelled") {
    res.status(400);
    throw new Error("Booking is already cancelled");
  }

  if (booking.status === "Completed") {
    res.status(400);
    throw new Error("Cannot cancel a completed booking");
  }

  // Calculate refund
  const refundEligibility = booking.refundEligibility;
  const refundAmount =
    booking.paymentStatus === "Paid"
      ? (booking.totalAmount * refundEligibility.percentage) / 100
      : 0;

  // Update booking
  booking.status = "Cancelled";
  booking.cancellation = {
    cancelledAt: new Date(),
    cancelledBy: req.user._id,
    cancellationReason: reason || "Cancelled by tourist",
    refundAmount,
    refundStatus: refundAmount > 0 ? "Pending" : "N/A",
  };

  if (refundAmount > 0) {
    booking.paymentStatus = "Refunded";
    booking.paymentDetails = booking.paymentDetails || {};
    booking.paymentDetails.refundAmount = refundAmount;
    booking.paymentDetails.refundReason = reason || "Booking cancelled";
  }

  await booking.save();

  // Send notification to guide
  if (notificationService) {
    await notificationService.sendNotification({
      recipientId: booking.guide._id,
      senderId: req.user._id,
      type: "booking_confirmation",
      title: "Booking Cancelled",
      message: `${req.user.name} has cancelled their booking for "${booking.package.title}"`,
      data: {
        packageId: booking.package._id,
        bookingId: booking._id,
        actionUrl: `/bookings/${booking._id}`,
      },
      priority: "normal",
    });
  }

  res.json({
    success: true,
    data: booking,
    message: `Booking cancelled successfully. ${
      refundAmount > 0
        ? `Refund of $${refundAmount.toFixed(2)} will be processed.`
        : ""
    }`,
  });
});

// @desc    Check availability
// @route   GET /api/bookings/availability/:packageId
// @access  Public
export const checkAvailability = asyncHandler(async (req, res) => {
  const { packageId } = req.params;
  const { date, travelers } = req.query;

  if (!date || !travelers) {
    res.status(400);
    throw new Error("Please provide date and number of travelers");
  }

  const availability = await Booking.checkAvailability(
    packageId,
    date,
    Number(travelers)
  );

  res.json({
    success: true,
    data: availability,
  });
});

// @desc    Get booking calendar (Guide)
// @route   GET /api/bookings/guide/calendar
// @access  Private (Guide only)
export const getBookingCalendar = asyncHandler(async (req, res) => {
  const { month, year } = req.query;

  const startDate = new Date(
    year || new Date().getFullYear(),
    month ? Number(month) - 1 : new Date().getMonth(),
    1
  );
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(0);

  const bookings = await Booking.find({
    guide: req.user._id,
    bookingDate: {
      $gte: startDate,
      $lte: endDate,
    },
    status: { $in: ["Pending", "Confirmed"] },
  })
    .populate("package", "title")
    .select("bookingDate numberOfTravelers status package");

  // Group bookings by date
  const calendar = {};

  bookings.forEach((booking) => {
    const dateKey = booking.bookingDate.toISOString().split("T")[0];
    if (!calendar[dateKey]) {
      calendar[dateKey] = {
        date: dateKey,
        bookings: [],
        totalTravelers: 0,
      };
    }
    calendar[dateKey].bookings.push({
      id: booking._id,
      package: booking.package.title,
      travelers: booking.numberOfTravelers,
      status: booking.status,
    });
    calendar[dateKey].totalTravelers += booking.numberOfTravelers;
  });

  res.json({
    success: true,
    data: Object.values(calendar),
  });
});

// @desc    Add guide notes
// @route   PUT /api/bookings/:id/notes
// @access  Private (Guide only)
export const addGuideNotes = asyncHandler(async (req, res) => {
  const { notes } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (booking.guide.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  booking.guideNotes = notes;
  await booking.save();

  res.json({
    success: true,
    data: booking,
    message: "Notes added successfully",
  });
});

// @desc    Get booking statistics (Guide)
// @route   GET /api/bookings/guide/statistics
// @access  Private (Guide only)
export const getBookingStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const dateRange = {};
  if (startDate) {
    dateRange.start = new Date(startDate);
  }
  if (endDate) {
    dateRange.end = new Date(endDate);
  }

  const stats = await Booking.getStatistics(req.user._id, dateRange);

  // Calculate totals
  const totals = {
    totalBookings: 0,
    totalRevenue: 0,
    byStatus: {},
  };

  stats.forEach((stat) => {
    totals.byStatus[stat._id] = {
      count: stat.count,
      revenue: stat.totalRevenue,
    };
    totals.totalBookings += stat.count;
    totals.totalRevenue += stat.totalRevenue;
  });

  res.json({
    success: true,
    data: {
      stats,
      totals,
    },
  });
});

export default {
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
};
