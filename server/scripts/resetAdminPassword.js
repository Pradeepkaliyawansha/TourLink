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

const resetAdminPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected\n");

    console.log("=== Reset Admin Password (Emergency) ===\n");
    console.log(
      "⚠️  WARNING: This script bypasses current password verification."
    );
    console.log("⚠️  Only use this if you've forgotten your admin password.\n");

    // Get admin email
    const email = await question("Enter admin email: ");

    // Find admin user
    const admin = await User.findOne({ email, role: "admin" });

    if (!admin) {
      console.log("\n❌ Admin account not found with this email");
      rl.close();
      process.exit(1);
    }

    console.log(`\nFound admin: ${admin.name} (${admin.email})\n`);

    // Confirm reset
    const confirm = await question(
      "Are you sure you want to reset the password? (yes/no): "
    );

    if (confirm.toLowerCase() !== "yes") {
      console.log("\n❌ Operation cancelled");
      rl.close();
      process.exit(0);
    }

    // Get new password
    const newPassword = await question(
      "\nEnter new password (min 6 characters): "
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

    console.log("\n✅ Admin password reset successfully!");
    console.log("\n=== New Admin Credentials ===");
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${newPassword}`);
    console.log(
      "\n⚠️  Please save these credentials securely and change the password after logging in!"
    );

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error resetting password:", error.message);
    rl.close();
    process.exit(1);
  }
};

resetAdminPassword();
