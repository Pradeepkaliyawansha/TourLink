import axiosInstance from "./axiosInstance";

// Register user
const register = async (userData) => {
  const response = await axiosInstance.post("/auth/register", userData);

  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }

  return response.data;
};

// Login user
const login = async (userData) => {
  console.log("authService: Logging in user...");
  console.log("authService: Login data:", {
    email: userData.email,
    isAdminLogin: userData.isAdminLogin,
  });

  const response = await axiosInstance.post("/auth/login", userData);

  console.log("authService: Login response:", response.data);

  if (response.data) {
    // Save to localStorage
    localStorage.setItem("user", JSON.stringify(response.data));
    console.log("authService: User saved to localStorage");

    // Verify it was saved correctly
    const saved = localStorage.getItem("user");
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log("authService: Verified saved user:", {
        _id: parsed._id,
        email: parsed.email,
        role: parsed.role,
        name: parsed.name,
      });
    }
  }

  return response.data;
};

// Logout user
const logout = () => {
  console.log("authService: Logging out user");
  localStorage.removeItem("user");
};

// Get current user
const getMe = async (token) => {
  console.log("authService: Getting current user");
  const response = await axiosInstance.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  getMe,
};

export default authService;
