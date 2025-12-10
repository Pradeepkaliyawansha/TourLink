import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@tourhub.com" });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists");
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: "Admin",
      email: "admin@tourhub.com",
      password: "admin123",
      phone: "+1234567890",
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
