import mongoose from "mongoose";
import dotenv from "dotenv";
import readline from "readline";
import User from "../models/User.js";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const changeAdminPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected\n");

    console.log("=== Change Admin Password ===\n");

    // Get admin email
    const email = await question("Enter admin email: ");

    // Find admin user
    const admin = await User.findOne({ email, role: "admin" }).select(
      "+password"
    );

    if (!admin) {
      console.log("\n❌ Admin account not found with this email");
      rl.close();
      process.exit(1);
    }

    console.log(`\nFound admin: ${admin.name} (${admin.email})\n`);

    // Get current password for verification
    const currentPassword = await question("Enter current password: ");

    // Verify current password
    const isPasswordMatch = await admin.matchPassword(currentPassword);

    if (!isPasswordMatch) {
      console.log("\n❌ Current password is incorrect");
      rl.close();
      process.exit(1);
    }

    // Get new password
    const newPassword = await question(
      "Enter new password (min 6 characters): "
    );

    if (newPassword.length < 6) {
      console.log("\n❌ Password must be at least 6 characters");
      rl.close();
      process.exit(1);
    }

    const confirmPassword = await question("Confirm new password: ");

    if (newPassword !== confirmPassword) {
      console.log("\n❌ Passwords do not match");
      rl.close();
      process.exit(1);
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    console.log("\n✅ Admin password updated successfully!");
    console.log("\n⚠️  Please use the new password for your next login.");

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error changing password:", error.message);
    rl.close();
    process.exit(1);
  }
};

changeAdminPassword();
