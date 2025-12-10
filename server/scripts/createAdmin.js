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

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected\n");

    console.log("=== Admin Account Creation ===\n");

    // Get admin details
    const name = await question("Enter admin name: ");
    const email = await question("Enter admin email: ");
    const password = await question(
      "Enter admin password (min 6 characters): "
    );
    const phone = await question("Enter admin phone (optional): ");

    // Validate inputs
    if (!name || !email || !password) {
      console.log("\n❌ Name, email, and password are required");
      rl.close();
      process.exit(1);
    }

    if (password.length < 6) {
      console.log("\n❌ Password must be at least 6 characters");
      rl.close();
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("\n⚠️  User with this email already exists");
      const confirm = await question(
        "Do you want to change this user to admin? (yes/no): "
      );

      if (confirm.toLowerCase() === "yes") {
        existingAdmin.role = "admin";
        await existingAdmin.save();
        console.log("\n✅ User successfully converted to admin");
      } else {
        console.log("\n❌ Operation cancelled");
      }

      rl.close();
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name,
      email,
      password,
      role: "admin",
      phone: phone || undefined,
    });

    console.log("\n✅ Admin account created successfully!");
    console.log("\n=== Admin Credentials ===");
    console.log(`Name: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log("\n⚠️  Please save these credentials securely!");

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating admin:", error.message);
    rl.close();
    process.exit(1);
  }
};

createAdmin();
