import mongoose from "mongoose";

const notificationPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    // Email notification settings
    email: {
      enabled: {
        type: Boolean,
        default: true,
      },
      types: {
        message: {
          type: Boolean,
          default: true,
        },
        booking_confirmation: {
          type: Boolean,
          default: true,
        },
        booking_request: {
          type: Boolean,
          default: true,
        },
        package_update: {
          type: Boolean,
          default: true,
        },
        new_review: {
          type: Boolean,
          default: true,
        },
        review_reply: {
          type: Boolean,
          default: true,
        },
        price_drop: {
          type: Boolean,
          default: true,
        },
        package_created: {
          type: Boolean,
          default: false,
        },
        system: {
          type: Boolean,
          default: true,
        },
      },
      frequency: {
        type: String,
        enum: ["instant", "daily", "weekly"],
        default: "instant",
      },
    },
    // In-app notification settings
    inApp: {
      enabled: {
        type: Boolean,
        default: true,
      },
      types: {
        message: {
          type: Boolean,
          default: true,
        },
        booking_confirmation: {
          type: Boolean,
          default: true,
        },
        booking_request: {
          type: Boolean,
          default: true,
        },
        package_update: {
          type: Boolean,
          default: true,
        },
        new_review: {
          type: Boolean,
          default: true,
        },
        review_reply: {
          type: Boolean,
          default: true,
        },
        price_drop: {
          type: Boolean,
          default: true,
        },
        package_created: {
          type: Boolean,
          default: true,
        },
        system: {
          type: Boolean,
          default: true,
        },
      },
      sound: {
        type: Boolean,
        default: true,
      },
      desktop: {
        type: Boolean,
        default: true,
      },
    },
    // Push notification settings
    push: {
      enabled: {
        type: Boolean,
        default: false,
      },
      subscription: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
      types: {
        message: {
          type: Boolean,
          default: true,
        },
        booking_confirmation: {
          type: Boolean,
          default: true,
        },
        booking_request: {
          type: Boolean,
          default: true,
        },
        package_update: {
          type: Boolean,
          default: false,
        },
        new_review: {
          type: Boolean,
          default: true,
        },
        review_reply: {
          type: Boolean,
          default: true,
        },
        price_drop: {
          type: Boolean,
          default: false,
        },
        package_created: {
          type: Boolean,
          default: false,
        },
        system: {
          type: Boolean,
          default: true,
        },
      },
    },
    // Do Not Disturb settings
    doNotDisturb: {
      enabled: {
        type: Boolean,
        default: false,
      },
      startTime: {
        type: String,
        default: "22:00",
        validate: {
          validator: function (v) {
            return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
          },
          message: "Start time must be in HH:MM format",
        },
      },
      endTime: {
        type: String,
        default: "08:00",
        validate: {
          validator: function (v) {
            return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
          },
          message: "End time must be in HH:MM format",
        },
      },
      days: {
        type: [String],
        enum: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        default: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
      },
    },
    // Additional settings
    digest: {
      enabled: {
        type: Boolean,
        default: false,
      },
      frequency: {
        type: String,
        enum: ["daily", "weekly"],
        default: "daily",
      },
      time: {
        type: String,
        default: "09:00",
        validate: {
          validator: function (v) {
            return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
          },
          message: "Time must be in HH:MM format",
        },
      },
      types: {
        type: [String],
        enum: [
          "message",
          "booking_confirmation",
          "booking_request",
          "package_update",
          "new_review",
          "review_reply",
          "price_drop",
          "package_created",
          "system",
        ],
        default: [
          "booking_confirmation",
          "booking_request",
          "new_review",
          "review_reply",
        ],
      },
    },
    // Mute specific users or packages
    muted: {
      users: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      packages: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Package",
        },
      ],
    },
    // Language preference for notifications
    language: {
      type: String,
      enum: ["en", "es", "fr", "de", "it", "pt", "ja", "zh", "ar"],
      default: "en",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient user lookup
notificationPreferenceSchema.index({ user: 1 });

// Static method to get or create preferences with defaults
notificationPreferenceSchema.statics.getOrCreate = async function (userId) {
  try {
    let preferences = await this.findOne({ user: userId });

    if (!preferences) {
      preferences = await this.create({ user: userId });
      console.log(
        `✅ Created default notification preferences for user: ${userId}`
      );
    }

    return preferences;
  } catch (error) {
    console.error("Error getting or creating preferences:", error);
    throw error;
  }
};

// Static method to create preferences for new user
notificationPreferenceSchema.statics.createForNewUser = async function (
  userId,
  customSettings = {}
) {
  try {
    const preferences = await this.create({
      user: userId,
      ...customSettings,
    });

    console.log(`✅ Created notification preferences for new user: ${userId}`);
    return preferences;
  } catch (error) {
    console.error("Error creating preferences for new user:", error);
    throw error;
  }
};

// Instance method to check if notification type is enabled for a channel
notificationPreferenceSchema.methods.isEnabled = function (channel, type) {
  // Check if channel exists and is enabled
  if (!this[channel] || !this[channel].enabled) {
    return false;
  }

  // Check if specific type is enabled
  if (this[channel].types && this[channel].types[type] !== undefined) {
    return this[channel].types[type];
  }

  // Default to true if type not specified
  return true;
};

// Instance method to check if in Do Not Disturb period
notificationPreferenceSchema.methods.isInDoNotDisturb = function () {
  if (!this.doNotDisturb.enabled) {
    return false;
  }

  const now = new Date();
  const currentDay = now.toLocaleString("en-US", { weekday: "long" });
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  // Check if current day is in DND days
  if (!this.doNotDisturb.days.includes(currentDay)) {
    return false;
  }

  const [startHour, startMin] = this.doNotDisturb.startTime
    .split(":")
    .map(Number);
  const [endHour, endMin] = this.doNotDisturb.endTime.split(":").map(Number);
  const [currentHour, currentMin] = currentTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const currentMinutes = currentHour * 60 + currentMin;

  // Handle overnight DND period
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }

  // Handle same-day DND period
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
};

// Instance method to check if user is muted
notificationPreferenceSchema.methods.isUserMuted = function (userId) {
  return this.muted.users.some(
    (mutedUserId) => mutedUserId.toString() === userId.toString()
  );
};

// Instance method to check if package is muted
notificationPreferenceSchema.methods.isPackageMuted = function (packageId) {
  return this.muted.packages.some(
    (mutedPackageId) => mutedPackageId.toString() === packageId.toString()
  );
};

// Instance method to mute a user
notificationPreferenceSchema.methods.muteUser = async function (userId) {
  if (!this.isUserMuted(userId)) {
    this.muted.users.push(userId);
    await this.save();
  }
  return this;
};

// Instance method to unmute a user
notificationPreferenceSchema.methods.unmuteUser = async function (userId) {
  this.muted.users = this.muted.users.filter(
    (mutedUserId) => mutedUserId.toString() !== userId.toString()
  );
  await this.save();
  return this;
};

// Instance method to mute a package
notificationPreferenceSchema.methods.mutePackage = async function (packageId) {
  if (!this.isPackageMuted(packageId)) {
    this.muted.packages.push(packageId);
    await this.save();
  }
  return this;
};

// Instance method to unmute a package
notificationPreferenceSchema.methods.unmutePackage = async function (
  packageId
) {
  this.muted.packages = this.muted.packages.filter(
    (mutedPackageId) => mutedPackageId.toString() !== packageId.toString()
  );
  await this.save();
  return this;
};

// Instance method to enable all notifications
notificationPreferenceSchema.methods.enableAll = async function () {
  this.email.enabled = true;
  this.inApp.enabled = true;

  // Enable all types for email
  Object.keys(this.email.types).forEach((type) => {
    this.email.types[type] = true;
  });

  // Enable all types for in-app
  Object.keys(this.inApp.types).forEach((type) => {
    this.inApp.types[type] = true;
  });

  await this.save();
  return this;
};

// Instance method to disable all notifications
notificationPreferenceSchema.methods.disableAll = async function () {
  this.email.enabled = false;
  this.inApp.enabled = false;
  this.push.enabled = false;

  await this.save();
  return this;
};

// Instance method to get summary of enabled notifications
notificationPreferenceSchema.methods.getSummary = function () {
  const enabledChannels = [];

  if (this.email.enabled) enabledChannels.push("email");
  if (this.inApp.enabled) enabledChannels.push("inApp");
  if (this.push.enabled) enabledChannels.push("push");

  const enabledTypes = {};

  ["email", "inApp", "push"].forEach((channel) => {
    if (this[channel] && this[channel].enabled && this[channel].types) {
      enabledTypes[channel] = Object.keys(this[channel].types).filter(
        (type) => this[channel].types[type]
      );
    }
  });

  return {
    channels: enabledChannels,
    types: enabledTypes,
    doNotDisturb: this.doNotDisturb.enabled,
    digest: this.digest.enabled,
    mutedUsersCount: this.muted.users.length,
    mutedPackagesCount: this.muted.packages.length,
  };
};

// Virtual for total muted items
notificationPreferenceSchema.virtual("totalMuted").get(function () {
  return this.muted.users.length + this.muted.packages.length;
});

// Ensure virtuals are included in JSON
notificationPreferenceSchema.set("toJSON", { virtuals: true });
notificationPreferenceSchema.set("toObject", { virtuals: true });

const NotificationPreference = mongoose.model(
  "NotificationPreference",
  notificationPreferenceSchema
);

export default NotificationPreference;
