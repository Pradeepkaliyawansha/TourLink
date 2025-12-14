import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, avatar } = req.body;

  // Validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  // Prevent admin registration through public endpoint
  if (role === "admin") {
    res.status(403);
    throw new Error("Admin accounts cannot be created through registration");
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Create user with default avatar if not provided
  const defaultAvatar =
    avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + name;

  const user = await User.create({
    name,
    email,
    password,
    role: role || "tourist",
    phone,
    avatar: defaultAvatar,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password, isAdminLogin } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  // Find user and include password
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // Check password
  const isPasswordMatch = await user.matchPassword(password);

  if (!isPasswordMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // ADMIN LOGIN TAB: Only admins can log in
  if (isAdminLogin === true) {
    if (user.role !== "admin") {
      res.status(403);
      throw new Error(
        "Access denied. This login is for administrators only. Please use User Login."
      );
    }
  }

  // USER LOGIN TAB: Only tourists and guides can log in (block admins)
  if (isAdminLogin === false) {
    if (user.role === "admin") {
      res.status(403);
      throw new Error(
        "Admin accounts must use Admin Login. Please switch to the Admin Login tab."
      );
    }
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar,
    createdAt: user.createdAt,
    token: generateToken(user._id),
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      createdAt: user.createdAt,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;

    // Update avatar if provided
    if (req.body.avatar) {
      user.avatar = req.body.avatar;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
      createdAt: updatedUser.createdAt,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Please provide current and new password");
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error("New password must be at least 6 characters");
  }

  // Get user with password
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Verify current password
  const isPasswordMatch = await user.matchPassword(currentPassword);

  if (!isPasswordMatch) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: "Password updated successfully",
  });
});

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password").sort({ createdAt: -1 });

  res.json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Prevent deleting admin accounts
  if (user.role === "admin") {
    res.status(403);
    throw new Error("Cannot delete admin accounts");
  }

  await user.deleteOne();

  res.json({
    success: true,
    message: "User deleted successfully",
  });
});

// @desc    Update user role (Admin only)
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!["tourist", "guide"].includes(role)) {
    res.status(400);
    throw new Error("Invalid role. Must be 'tourist' or 'guide'");
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Prevent modifying admin accounts
  if (user.role === "admin") {
    res.status(403);
    throw new Error("Cannot modify admin accounts");
  }

  user.role = role;
  await user.save();

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
});
