import mongoose from "mongoose";

const travelerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
    min: 0,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  idNumber: {
    type: String,
    trim: true,
  },
  specialRequirements: {
    type: String,
    trim: true,
  },
});

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
      index: true,
    },
    tourist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    guide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    bookingDate: {
      type: Date,
      required: true,
      index: true,
    },
    numberOfTravelers: {
      type: Number,
      required: true,
      min: 1,
    },
    travelers: [travelerSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded", "Failed"],
      default: "Pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Credit Card", "Debit Card", "PayPal", "Bank Transfer", "Cash"],
    },
    paymentDetails: {
      transactionId: String,
      paidAt: Date,
      refundedAt: Date,
      refundAmount: Number,
      refundReason: String,
    },
    specialRequests: {
      type: String,
      trim: true,
    },
    cancellation: {
      cancelledAt: Date,
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      cancellationReason: String,
      refundAmount: Number,
      refundStatus: {
        type: String,
        enum: ["Pending", "Approved", "Rejected", "Processed"],
      },
    },
    contactInfo: {
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    notes: {
      type: String,
    },
    guideNotes: {
      type: String,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    reviewSubmitted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique booking code before saving
bookingSchema.pre("save", async function (next) {
  if (!this.bookingCode) {
    const prefix = "TH";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.bookingCode = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

// Indexes for efficient querying
bookingSchema.index({ tourist: 1, createdAt: -1 });
bookingSchema.index({ guide: 1, bookingDate: 1 });
bookingSchema.index({ package: 1, bookingDate: 1 });
bookingSchema.index({ status: 1, bookingDate: 1 });
bookingSchema.index({ bookingCode: 1 });

// Virtual for days until booking
bookingSchema.virtual("daysUntilBooking").get(function () {
  const now = new Date();
  const booking = new Date(this.bookingDate);
  const diffTime = booking - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for can cancel
bookingSchema.virtual("canCancel").get(function () {
  if (this.status === "Cancelled" || this.status === "Completed") {
    return false;
  }
  const now = new Date();
  const booking = new Date(this.bookingDate);
  const diffHours = (booking - now) / (1000 * 60 * 60);
  return diffHours >= 48; // Can cancel up to 48 hours before
});

// Virtual for refund amount
bookingSchema.virtual("refundEligibility").get(function () {
  if (this.status !== "Cancelled" && this.status !== "Pending") {
    return { eligible: false, percentage: 0 };
  }

  const now = new Date();
  const booking = new Date(this.bookingDate);
  const diffHours = (booking - now) / (1000 * 60 * 60);

  if (diffHours >= 168) return { eligible: true, percentage: 100 }; // 7 days - 100%
  if (diffHours >= 72) return { eligible: true, percentage: 75 }; // 3 days - 75%
  if (diffHours >= 48) return { eligible: true, percentage: 50 }; // 2 days - 50%
  return { eligible: false, percentage: 0 }; // Less than 48 hours - no refund
});

// Ensure virtuals are included in JSON
bookingSchema.set("toJSON", { virtuals: true });
bookingSchema.set("toObject", { virtuals: true });

// Static method to check availability
bookingSchema.statics.checkAvailability = async function (
  packageId,
  bookingDate,
  numberOfTravelers
) {
  const Package = mongoose.model("Package");
  const pkg = await Package.findById(packageId);

  if (!pkg) {
    throw new Error("Package not found");
  }

  // Get bookings for the same date
  const existingBookings = await this.find({
    package: packageId,
    bookingDate: {
      $gte: new Date(bookingDate).setHours(0, 0, 0, 0),
      $lt: new Date(bookingDate).setHours(23, 59, 59, 999),
    },
    status: { $in: ["Pending", "Confirmed"] },
  });

  const bookedTravelers = existingBookings.reduce(
    (sum, booking) => sum + booking.numberOfTravelers,
    0
  );

  const availableSpots = pkg.maxGroupSize - bookedTravelers;

  return {
    available: availableSpots >= numberOfTravelers,
    availableSpots,
    maxGroupSize: pkg.maxGroupSize,
    bookedSpots: bookedTravelers,
  };
};

// Static method to get booking statistics
bookingSchema.statics.getStatistics = async function (guideId, dateRange) {
  const match = { guide: mongoose.Types.ObjectId(guideId) };

  if (dateRange) {
    match.createdAt = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end),
    };
  }

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);

  return stats;
};

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
