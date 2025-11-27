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
  const response = await axiosInstance.post("/auth/login", userData);
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem("user");
};

// Get current user
const getMe = async (token) => {
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
